import { App, TFile } from "obsidian";
import type { VaultFile } from "./types";
import { SYNCABLE_BINARY_EXTENSIONS } from "./types";
import {
    uploadToStorage, downloadFromStorage, deleteFromStorage,
} from "./supabase-client";
import {
    upsertVaultFile, deleteVaultFileRecord, getVaultFiles,
} from "./supabase-api";

let app: App;
let vaultId = "";

export function initBinarySync(obsidianApp: App, vault: string): void {
    app = obsidianApp;
    vaultId = vault;
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
        await deleteFromStorage("vault-files", `${vaultId}/${path}`);
        await deleteVaultFileRecord(vaultId, path);
        return;
    }

    if (type === "rename" && oldPath) {
        await deleteFromStorage("vault-files", `${vaultId}/${oldPath}`);
        await deleteVaultFileRecord(vaultId, oldPath);
    }

    const file = vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;

    const data = await vault.readBinary(file);
    const storagePath = `${vaultId}/${path}`;
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const contentType = mimeFromExt(ext);

    await uploadToStorage("vault-files", storagePath, data, contentType);
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

export async function pullBinaryFiles(): Promise<void> {
    const vault = app.vault;
    const remoteFiles = await getVaultFiles(vaultId);

    for (const rf of remoteFiles) {
        try {
            const localFile = vault.getAbstractFileByPath(rf.path);
            if (!localFile) {
                const data = await downloadFromStorage("vault-files", rf.storage_path);
                await vault.createBinary(rf.path, data);
            } else if (localFile instanceof TFile) {
                const remoteTime = new Date(rf.updated_at).getTime();
                const localTime = localFile.stat.mtime;
                if (remoteTime > localTime) {
                    const data = await downloadFromStorage("vault-files", rf.storage_path);
                    await vault.trash(localFile, true);
                    await vault.createBinary(rf.path, data);
                }
            }
        } catch (err) {
            console.warn(`[SupSync] Binary pull failed for ${rf.path}:`, err);
        }
    }
}
