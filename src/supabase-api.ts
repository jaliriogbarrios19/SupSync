import type { SupabaseNote, SupabaseLock, VaultFile } from "./types";
import {
    supabaseGet, supabasePost, supabasePatch, supabaseDelete, retryWithBackoff,
} from "./supabase-client";

// --- Vaults ---

export async function createVault(name: string): Promise<{ id: string; name: string }> {
    const vaults = await retryWithBackoff(() =>
        supabasePost<{ id: string; name: string }>("vaults", { name }),
    );
    if (!vaults) throw new Error("Failed to create vault");
    return vaults;
}

export async function getVault(vaultId: string): Promise<{ id: string; name: string } | null> {
    const vaults = await retryWithBackoff(() =>
        supabaseGet<Array<{ id: string; name: string }>>("vaults", {
            id: `eq.${vaultId}`,
        }),
    );
    return vaults.length > 0 ? vaults[0] : null;
}

export async function joinVault(vaultId: string): Promise<void> {
    await retryWithBackoff(() =>
        supabasePost("vault_members", {
            vault_id: vaultId,
            user_id: "auth.uid()",
        }),
    );
}

export async function getVaultMembers(vaultId: string): Promise<
    Array<{ user_id: string; role: string; joined_at: string }>
> {
    return retryWithBackoff(() =>
        supabaseGet<Array<{ user_id: string; role: string; joined_at: string }>>(
            "vault_members",
            {
                vault_id: `eq.${vaultId}`,
                select: "user_id,role,joined_at",
            },
        ),
    );
}

export async function removeMember(vaultId: string, userId: string): Promise<void> {
    await retryWithBackoff(() =>
        supabaseDelete("vault_members", {
            vault_id: `eq.${vaultId}`,
            user_id: `eq.${userId}`,
        }),
    );
}

export async function isVaultAdmin(vaultId: string): Promise<boolean> {
    const members = await retryWithBackoff(() =>
        supabaseGet<Array<{ role: string }>>(
            "vault_members",
            {
                vault_id: `eq.${vaultId}`,
                user_id: `eq.auth.uid()`,
            },
        ),
    );
    return members.length > 0 && members[0].role === "admin";
}

// --- Notes ---

export async function fetchNotes(
    vaultId: string,
    since?: string,
): Promise<SupabaseNote[]> {
    const query: Record<string, string> = {
        vault_id: `eq.${vaultId}`,
        order: "updated_at.asc",
        select: "*",
    };
    if (since) {
        query.updated_at = `gt.${since}`;
    }
    return retryWithBackoff(() => supabaseGet<SupabaseNote[]>("notes", query));
}

export async function upsertNote(
    vaultId: string,
    path: string,
    content: string,
): Promise<void> {
    const body = {
        vault_id: vaultId,
        path,
        content,
        updated_at: new Date().toISOString(),
        deleted: false,
    };
    await retryWithBackoff(() =>
        supabasePost<SupabaseNote | null>("notes", body, {
            on_conflict: "vault_id,path",
        }),
    );
}

export async function softDeleteNote(vaultId: string, path: string): Promise<void> {
    await retryWithBackoff(() =>
        supabasePatch(
            "notes",
            { deleted: true, updated_at: new Date().toISOString() },
            { vault_id: `eq.${vaultId}`, path: `eq.${path}` },
        ),
    );
}

export async function renameNote(
    vaultId: string,
    oldPath: string,
    newPath: string,
): Promise<void> {
    await retryWithBackoff(() =>
        supabasePatch(
            "notes",
            { path: newPath, updated_at: new Date().toISOString() },
            { vault_id: `eq.${vaultId}`, path: `eq.${oldPath}` },
        ),
    );
}

// --- Locks ---

export async function acquireLock(
    vaultId: string,
    path: string,
    ttlMinutes = 2,
): Promise<SupabaseLock | null> {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000).toISOString();
    return retryWithBackoff(() =>
        supabasePost<SupabaseLock | null>("locks", {
            vault_id: vaultId,
            path,
            expires_at: expiresAt,
        }),
    );
}

export async function refreshLock(lockId: string, ttlMinutes = 2): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000).toISOString();
    await retryWithBackoff(() =>
        supabasePatch("locks", { expires_at: expiresAt }, { id: `eq.${lockId}` }),
    );
}

export async function releaseLock(lockId: string): Promise<void> {
    await retryWithBackoff(() => supabaseDelete("locks", { id: `eq.${lockId}` }));
}

export async function getActiveLock(
    vaultId: string,
    path: string,
): Promise<SupabaseLock | null> {
    const now = new Date().toISOString();
    const locks = await retryWithBackoff(() =>
        supabaseGet<SupabaseLock[]>("locks", {
            vault_id: `eq.${vaultId}`,
            path: `eq.${path}`,
            expires_at: `gt.${now}`,
            limit: "1",
        }),
    );
    return locks.length > 0 ? locks[0] : null;
}

// --- Vault Files ---

export async function upsertVaultFile(file: Omit<VaultFile, "id">): Promise<void> {
    await retryWithBackoff(() =>
        supabasePost<VaultFile | null>("vault_files", file, {
            on_conflict: "vault_id,path",
        }),
    );
}

export async function deleteVaultFileRecord(
    vaultId: string,
    path: string,
): Promise<void> {
    await retryWithBackoff(() =>
        supabaseDelete("vault_files", {
            vault_id: `eq.${vaultId}`,
            path: `eq.${path}`,
        }),
    );
}

export async function getStorageUsage(vaultId: string): Promise<number> {
    const files = await retryWithBackoff(() =>
        supabaseGet<Array<{ size: number }>>("vault_files", {
            vault_id: `eq.${vaultId}`,
            select: "size",
        }),
    );
    return files.reduce((sum, f) => sum + (f.size || 0), 0);
}

export async function getVaultFiles(vaultId: string): Promise<VaultFile[]> {
    return retryWithBackoff(() =>
        supabaseGet<VaultFile[]>("vault_files", {
            vault_id: `eq.${vaultId}`,
            select: "*",
        }),
    );
}
