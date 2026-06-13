import { App, Notice, TFile, normalizePath } from "obsidian";
import type { SupSyncSettings } from "./types";
import { STORAGE_WARNING_THRESHOLD } from "./types";
import {
    fetchNotes, getStorageUsage,
} from "./supabase-api";
import { getAccessToken, refreshAccessToken } from "./supabase-client";
import { pullBinaryFiles } from "./binary-sync";
import { ConflictModal } from "./conflict-modal";
import { matchGlob } from "./glob-match";
import { t } from "./i18n";

interface SyncPullDeps {
    app: App;
    settings: SupSyncSettings;
    vaultId: string;
    lastSyncAt: { value: string };
    isRemoteChange: { value: boolean };
    onStatusChange: ((status: string) => void) | null;
    onProgress: ((current: number, total: number) => void) | null;
    flushQueue: () => Promise<void>;
}

export async function pullChanges(deps: SyncPullDeps): Promise<void> {
    const { app, settings, vaultId, lastSyncAt, isRemoteChange, onStatusChange, onProgress } = deps;
    if (!vaultId) return;

    if (!getAccessToken()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) return;
    }
    if (onStatusChange) onStatusChange("pulling");

    try {
        const notes = await fetchNotes(vaultId, lastSyncAt.value || undefined);
        const vault = app.vault;
        const total = notes.length;

        for (let i = 0; i < total; i++) {
            const note = notes[i];
            if (isPathExcluded(note.path, settings.excludedPaths, app.vault.configDir)) continue;
            if (onProgress) onProgress(i + 1, total);

            isRemoteChange.value = true;
            const existing = vault.getAbstractFileByPath(note.path);

            if (note.deleted) {
                if (existing instanceof TFile) await app.fileManager.trashFile(existing);
                lastSyncAt.value = maxTimestamp(lastSyncAt.value, note.updated_at);
                isRemoteChange.value = false;
                continue;
            }

            if (existing instanceof TFile) {
                const localContent = await vault.read(existing);
                if (note.content === localContent) {
                    lastSyncAt.value = maxTimestamp(lastSyncAt.value, note.updated_at);
                    isRemoteChange.value = false;
                    continue;
                }

                const action = resolveConflict(
                    existing.stat.mtime,
                    note.updated_at,
                    settings.conflictMode,
                );

                if (action === "accept-remote") {
                    await vault.modify(existing, note.content);
                } else if (action === "ask") {
                    const modal = new ConflictModal(
                        app, note.path, localContent, note.content,
                    );
                    const choice = await modal.prompt();
                    if (choice === "remote") {
                        await vault.modify(existing, note.content);
                    }
                }
                } else {
                    const folder = note.path.split("/").slice(0, -1).join("/");
                    if (folder) {
                        try {
                            await vault.createFolder(normalizePath(folder));
                        } catch {
                            // ok
                        }
                    }
                    await vault.create(note.path, note.content);
                }

            lastSyncAt.value = maxTimestamp(lastSyncAt.value, note.updated_at);
            isRemoteChange.value = false;
        }

        await pullBinaryFiles();
        await checkStorageWarning(settings, vaultId);
    } catch (err) {
        console.error("[SupSync] Pull failed:", err);
        if (onStatusChange) onStatusChange("error");
    } finally {
        isRemoteChange.value = false;
        if (onStatusChange) onStatusChange("idle");
    }
}

export async function fullSync(deps: SyncPullDeps): Promise<void> {
    const { vaultId, lastSyncAt } = deps;
    if (!vaultId) {
        new Notice(t("plugin.pleaseSignIn"));
        return;
    }

    if (!getAccessToken()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            new Notice(t("plugin.pleaseSignIn"));
            return;
        }
    }

    lastSyncAt.value = "";
    try {
        await pullChanges(deps);
        await deps.flushQueue();
        new Notice(t("plugin.syncComplete"));
    } catch (err) {
        console.error("[SupSync] Full sync failed:", err);
        new Notice(t("plugin.syncFailed"));
    }
}

async function checkStorageWarning(
    settings: SupSyncSettings,
    vaultId: string,
): Promise<void> {
    try {
        const used = await getStorageUsage(vaultId);
        const limitBytes = settings.storageLimitMB * 1024 * 1024;
        const pct = used / limitBytes;
        if (pct > STORAGE_WARNING_THRESHOLD) {
            const usedMB = Math.round(used / (1024 * 1024));
            new Notice(
                t("plugin.storageWarning", {
                    used: usedMB,
                    limit: settings.storageLimitMB,
                    pct: Math.round(pct * 100),
                }),
                8000,
            );
        }
    } catch {
        // non-critical
    }
}

function isPathExcluded(path: string, excludedPaths: string[], configDir: string): boolean {
    if (path.startsWith(configDir + "/") || path === configDir) return true;
    return excludedPaths.some(
        (p) => matchGlob(p, path),
    );
}

function maxTimestamp(a: string, b: string): string {
    return a > b ? a : b;
}

export type ConflictAction = "accept-remote" | "keep-local" | "ask";

export function resolveConflict(
    localMtime: number,
    remoteIsoTimestamp: string,
    mode: string,
): ConflictAction {
    if (mode === "remote-wins") return "accept-remote";
    if (mode === "local-wins") return "keep-local";
    if (mode === "ask") return "ask";
    const remoteTime = new Date(remoteIsoTimestamp).getTime();
    return remoteTime > localMtime ? "accept-remote" : "keep-local";
}
