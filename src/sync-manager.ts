import { App, TFile } from "obsidian";
import type { SupSyncSettings, PendingChange } from "./types";
import {
    DEBOUNCE_MS, SYNCABLE_ALL_EXTENSIONS,
} from "./types";
import { matchGlob } from "./glob-match";
import {
    upsertNote, softDeleteNote, renameNote,
} from "./supabase-api";
import { getAccessToken, refreshAccessToken } from "./supabase-client";
import {
    initBinarySync, isBinaryFile, pushBinaryFile,
} from "./binary-sync";
import { pullChanges as pullImpl, fullSync as fullImpl } from "./sync-pull";
import { setPendingCount, addSyncError } from "./status-bar";

let app: App;
let settings: SupSyncSettings;
let vaultId = "";
let lastSyncAt = { value: "" };
let isRemote = { value: false };
let pendingQueue: PendingChange[] = [];
let debounceTimer: number | null = null;
let syncIntervalTimer: number | null = null;
let onStatusChange: ((status: string) => void) | null = null;

export function initSyncManager(
    obsidianApp: App,
    pluginSettings: SupSyncSettings,
    userId: string,
    vault: string,
    statusCb: (status: string) => void,
): void {
    app = obsidianApp;
    settings = pluginSettings;
    vaultId = vault;
    onStatusChange = statusCb;

    initBinarySync(app, vault);
    registerVaultEvents();
}

export function setVaultId(id: string): void {
    vaultId = id;
}

export function startPolling(): void {
    stopPolling();
    if (settings.syncInterval > 0 && vaultId) {
        syncIntervalTimer = window.setInterval(() => {
            void pullChanges();
        }, settings.syncInterval * 60000);
    }
}

export function stopPolling(): void {
    if (syncIntervalTimer !== null) {
        window.clearInterval(syncIntervalTimer);
        syncIntervalTimer = null;
    }
}

// --- Pull wrappers ---

export async function pullChanges(): Promise<void> {
    await pullImpl({
        app, settings, vaultId, lastSyncAt, isRemoteChange: isRemote,
        onStatusChange, flushQueue, onProgress: null,
    });
}

export async function fullSync(onProgress?: ((c: number, t: number) => void)): Promise<void> {
    await fullImpl({
        app, settings, vaultId, lastSyncAt, isRemoteChange: isRemote,
        onStatusChange, flushQueue, onProgress: onProgress || null,
    });
}

// --- Event registration ---

function registerVaultEvents(): void {
    const vault = app.vault;

    vault.on("modify", (file) => {
        if (file instanceof TFile) enqueueChange(file.path, "modify");
    });

    vault.on("create", (file) => {
        if (file instanceof TFile) enqueueChange(file.path, "create");
    });

    vault.on("delete", (file) => {
        if (file instanceof TFile) enqueueChange(file.path, "delete");
    });

    vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) enqueueRename(oldPath, file.path);
    });
}

// --- Queue ---

function enqueueChange(path: string, type: PendingChange["type"]): void {
    if (isRemote.value) return;
    if (!isSyncableFile(path)) return;
    if (isExcluded(path)) return;
    if (duplicatePending(path, type)) return;

    pendingQueue.push({ path, type, isRemote: false, timestamp: Date.now() });
    setPendingCount(pendingQueue.length);
    scheduleFlush();
}

function enqueueRename(oldPath: string, newPath: string): void {
    if (isRemote.value) return;
    const oldOk = isSyncableFile(oldPath);
    const newOk = isSyncableFile(newPath);
    if (!oldOk && !newOk) return;

    if (oldOk && !newOk) {
        pendingQueue.push({
            path: oldPath, type: "delete",
            isRemote: false, timestamp: Date.now(),
        });
    } else if (!oldOk && newOk) {
        pendingQueue.push({
            path: newPath, type: "create",
            isRemote: false, timestamp: Date.now(),
        });
    } else {
        pendingQueue.push({
            path: newPath, type: "rename", oldPath,
            isRemote: false, timestamp: Date.now(),
        });
    }
    scheduleFlush();
}

function duplicatePending(path: string, type: string): boolean {
    return pendingQueue.some(
        (c) => c.path === path && c.type === type
            && Date.now() - c.timestamp < DEBOUNCE_MS * 2,
    );
}

function scheduleFlush(): void {
    if (debounceTimer !== null) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => { void flushQueue(); }, DEBOUNCE_MS);
}

export async function flushQueue(): Promise<void> {
    if (pendingQueue.length === 0) return;
    if (!vaultId) return;

    if (!getAccessToken()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) return;
    }

    const batch = [...pendingQueue];
    pendingQueue = [];
    const deduped = dedupeChanges(batch);

    if (onStatusChange) onStatusChange("pushing");

    for (const change of deduped) {
        try {
            await pushChange(change);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.warn(`[SupSync] Push failed for ${change.path}:`, err);
            addSyncError(change.path, msg);
        }
    }

    setPendingCount(pendingQueue.length);
    if (onStatusChange) onStatusChange("idle");
}

export function dedupeChanges(changes: PendingChange[]): PendingChange[] {
    const byPath = new Map<string, PendingChange>();
    for (const c of changes) {
        const existing = byPath.get(c.path);
        if (!existing || c.timestamp > existing.timestamp) {
            byPath.set(c.path, c);
        }
    }
    return [...byPath.values()];
}

// --- Push ---

async function pushChange(change: PendingChange): Promise<void> {
    if (isBinaryFile(change.path)) {
        await pushBinaryFile(change.path, change.type, change.oldPath);
        return;
    }
    await pushTextChange(change);
}

async function pushTextChange(change: PendingChange): Promise<void> {
    const vault = app.vault;

    if (change.type === "delete") {
        await softDeleteNote(vaultId, change.path);
        return;
    }

    if (change.type === "rename" && change.oldPath) {
        await renameNote(vaultId, change.oldPath, change.path);
        return;
    }

    const file = vault.getAbstractFileByPath(change.path);
    if (!(file instanceof TFile)) return;

    const content = await vault.read(file);
    await upsertNote(vaultId, change.path, content);
}

// --- Utility ---

export function isSyncableFile(path: string): boolean {
    return SYNCABLE_ALL_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
}

function isExcluded(path: string): boolean {
    const configDir = app.vault.configDir;
    if (path.startsWith(configDir + "/") || path === configDir) return true;
    return settings.excludedPaths.some(
        (p) => matchGlob(p, path),
    );
}

// --- Cleanup ---

export function cleanup(): void {
    stopPolling();
    if (debounceTimer !== null) window.clearTimeout(debounceTimer);
    pendingQueue = [];
}
