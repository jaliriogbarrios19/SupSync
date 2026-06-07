import { Notice } from "obsidian";
import type { SupSyncSettings } from "./types";
import { LOCK_TTL_MS, LOCK_HEARTBEAT_MS } from "./types";
import {
    acquireLock, refreshLock, releaseLock, getActiveLock,
} from "./supabase-api";
import { getAccessToken, getCurrentUserId } from "./supabase-client";
import { t } from "./i18n";

interface LockState {
    lockId: string;
    vaultId: string;
    path: string;
    heartbeatTimer: number | null;
}

export class LockManager {
    private activeLocks = new Map<string, LockState>();
    private onLockChanged: (path: string, lockedBy: string | null) => void;
    private settings: SupSyncSettings;

    constructor(
        settings: SupSyncSettings,
        onLockChanged: (path: string, lockedBy: string | null) => void,
    ) {
        this.settings = settings;
        this.onLockChanged = onLockChanged;
    }

    private lockKey(vaultId: string, path: string): string {
        return `${vaultId}::${path}`;
    }

    isLockedLocally(vaultId: string, path: string): boolean {
        return this.activeLocks.has(this.lockKey(vaultId, path));
    }

    async tryAcquire(vaultId: string, path: string): Promise<boolean> {
        if (!getAccessToken()) return false;
        const key = this.lockKey(vaultId, path);
        if (this.activeLocks.has(key)) return true;

        const existing = await getActiveLock(vaultId, path);
        if (existing && existing.user_id !== getCurrentUserId()) {
            this.onLockChanged(path, existing.user_id);
            return false;
        }

        const lock = await acquireLock(vaultId, path);
        if (!lock) return false;

        const state: LockState = {
            lockId: lock.id,
            vaultId,
            path,
            heartbeatTimer: null,
        };
        state.heartbeatTimer = window.setInterval(() => {
            void this.heartbeat(state);
        }, LOCK_HEARTBEAT_MS);

        this.activeLocks.set(key, state);
        this.onLockChanged(path, null);
        return true;
    }

    private async heartbeat(state: LockState): Promise<void> {
        try {
            await refreshLock(state.lockId);
        } catch {
            this.release(state.vaultId, state.path);
            new Notice(t("plugin.lostLock", { path: state.path }));
        }
    }

    release(vaultId: string, path: string): void {
        const key = this.lockKey(vaultId, path);
        const state = this.activeLocks.get(key);
        if (!state) return;

        if (state.heartbeatTimer !== null) {
            window.clearInterval(state.heartbeatTimer);
        }
        this.activeLocks.delete(key);
        this.onLockChanged(path, null);

        void (async () => {
            try {
                await releaseLock(state.lockId);
            } catch {
                // Lock may have already expired on server
            }
        })();
    }

    releaseAll(): Promise<void[]> {
        const releases: Promise<void>[] = [];
        for (const [key, state] of this.activeLocks) {
            if (state.heartbeatTimer !== null) {
                window.clearInterval(state.heartbeatTimer);
            }
            const p = (async () => {
                try {
                    await releaseLock(state.lockId);
                } catch {
                    // ignore
                }
            })();
            releases.push(p);
        }
        this.activeLocks.clear();
        return Promise.all(releases);
    }

    async refreshAll(): Promise<void> {
        for (const [, state] of this.activeLocks) {
            try {
                await refreshLock(state.lockId);
            } catch {
                this.release(state.vaultId, state.path);
            }
        }
    }
}
