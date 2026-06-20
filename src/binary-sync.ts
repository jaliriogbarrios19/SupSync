import { App, TFile } from "obsidian";
import type { SupSyncSettings } from "./types";
import { SYNCABLE_BINARY_EXTENSIONS } from "./types";
import { matchGlob } from "./glob-match";
import {
    uploadToStorage, downloadFromStorage, deleteFromStorage,
    retryWithBackoff,
} from "./supabase-client";
import {
    upsertVaultFile, deleteVaultFileRecord, getVaultFiles,
} from "./supabase-api";

let app: App;
let vaultId = "";
let maxFileSizeMB = 50;
let excludedPaths: string[] = [];

export function initBinarySync(obsidianApp: App, vault: string, pluginSettings?: SupSyncSettings): void {
    app = obsidianApp;
    vaultId = vault;
    if (pluginSettings?.maxFileSizeMB) maxFileSizeMB = pluginSettings.maxFileSizeMB;
    if (pluginSettings?.excludedPaths) excludedPaths = pluginSettings.excludedPaths;
}

function isExcluded(path: string): boolean {
    const configDir = app.vault.configDir;
    if (path.startsWith(configDir + "/") || path === configDir) return true;
    return excludedPaths.some((p) => matchGlob(p, path));
}

function sanitizeStoragePath(path: string): string {
    return path.replace(/[^\p{ASCII}]/gu, (ch) => {
        const code = ch.charCodeAt(0);
        return code.toString(16).padStart(4, '0');
    });
}

export function isBinaryFile(path: string): boolean {
    const lower = path.toLowerCase();
    return SYNCABLE_BINARY_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function mimeFromExt(ext: string): string {
    const map: Record<string, string> = {
        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
        webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
        pdf: "application/pdf", mp3: "audio/mpeg", wav: "audio/wav",
        ogg: "audio/ogg", m4a: "audio/mp4",
    };
    return map[ext] || "application/octet-stream";
}

export async function pushBinaryFile(
    path: string,
    type: "create" | "modify" | "delete" | "rename",
    oldPath?: string,
): Promise<void> {
    const vault = app.vault;

    if (type === "delete") {
        await deleteFromStorage("vault-files", sanitizeStoragePath(`${vaultId}/${path}`));
        await deleteVaultFileRecord(vaultId, path);
        return;
    }

    if (type === "rename" && oldPath) {
        await deleteFromStorage("vault-files", sanitizeStoragePath(`${vaultId}/${oldPath}`));
        await deleteVaultFileRecord(vaultId, oldPath);
    }

    const file = vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.stat.size > maxBytes) {
        console.info(`[SupSync] Skipping ${path} (${(file.stat.size / 1048576).toFixed(1)} MB > ${maxFileSizeMB} MB limit)`);
        return;
    }

    const data = await vault.readBinary(file);
    const storagePath = sanitizeStoragePath(`${vaultId}/${path}`);
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const contentType = mimeFromExt(ext);

    await retryWithBackoff(() =>
        uploadToStorage("vault-files", storagePath, data, contentType),
    );
    await upsertVaultFile({
        vault_id: vaultId,
        path,
        size: data.byteLength,
        hash: "",
        storage_path: storagePath,
        content_type: contentType,
        updated_at: new Date().toISOString(),
    });
}

async function ensureParentFolders(path: string): Promise<void> {
    const parts = path.split("/");
    let current = "";
    for (let i = 0; i < parts.length - 1; i++) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        const exists = app.vault.getAbstractFileByPath(current);
        if (!exists) {
            try {
                await app.vault.createFolder(current);
            } catch {
                await app.vault.adapter.mkdir(current);
            }
        }
    }
}

export async function pullBinaryFiles(): Promise<void> {
    const vault = app.vault;
    const remoteFiles = await getVaultFiles(vaultId);
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    for (const rf of remoteFiles) {
        try {
            if (isExcluded(rf.path)) continue;
            if (rf.size > maxBytes) {
                console.info(`[SupSync] Skipping pull ${rf.path} (${(rf.size / 1048576).toFixed(1)} MB > ${maxFileSizeMB} MB limit)`);
                continue;
            }
            const localFile = vault.getAbstractFileByPath(rf.path);
            if (!localFile) {
                const data = await retryWithBackoff(() =>
                    downloadFromStorage("vault-files", rf.storage_path),
                );
                await ensureParentFolders(rf.path);
                await vault.createBinary(rf.path, data);
            } else if (localFile instanceof TFile) {
                const remoteTime = new Date(rf.updated_at).getTime();
                const localTime = localFile.stat.mtime;
                if (remoteTime > localTime) {
                    const data = await retryWithBackoff(() =>
                        downloadFromStorage("vault-files", rf.storage_path),
                    );
                    await app.fileManager.trashFile(localFile);
                    await ensureParentFolders(rf.path);
                    await vault.createBinary(rf.path, data);
                }
            }
        } catch (err) {
            console.warn(`[SupSync] Binary pull failed for ${rf.path}:`, err);
        }
    }
}
