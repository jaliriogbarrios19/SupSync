export interface SupSyncSettings {
    supabaseUrl: string;
    supabaseAnonKey: string;
    syncInterval: number;
    conflictMode: "local-wins" | "remote-wins" | "latest-wins" | "ask";
    excludedPaths: string[];
    storageLimitMB: number;
    maxFileSizeMB: number;
    lastSeenVersion: string;
}

export const DEFAULT_SETTINGS: SupSyncSettings = {
    supabaseUrl: "",
    supabaseAnonKey: "",
    syncInterval: 0,
    conflictMode: "latest-wins",
    excludedPaths: [".git/", ".trash/", ".DS_Store", "Thumbs.db"],
    storageLimitMB: 1024,
    maxFileSizeMB: 50,
    lastSeenVersion: "",
};

export const SUPABASE_REALTIME_URL_SUFFIX = "/realtime/v1/websocket";

export const DEBOUNCE_MS = 500;
export const LOCK_TTL_MS = 120000;
export const LOCK_HEARTBEAT_MS = 30000;
export const STORAGE_WARNING_THRESHOLD = 0.80;

export const SYNCABLE_TEXT_EXTENSIONS = [".md", ".canvas", ".excalidraw"];
export const SYNCABLE_BINARY_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
    ".pdf",
    ".mp3", ".wav", ".ogg", ".m4a",
];
export const SYNCABLE_ALL_EXTENSIONS = [
    ...SYNCABLE_TEXT_EXTENSIONS,
    ...SYNCABLE_BINARY_EXTENSIONS,
];

export interface SupabaseNote {
    id: string;
    vault_id: string;
    path: string;
    content: string;
    updated_at: string;
    deleted: boolean;
    updated_by: string | null;
}

export interface SupabaseLock {
    id: string;
    vault_id: string;
    path: string;
    user_id: string;
    acquired_at: string;
    expires_at: string;
}

export interface VaultFile {
    id: string;
    vault_id: string;
    path: string;
    size: number;
    hash: string;
    storage_path: string;
    content_type: string;
    updated_at: string;
}

export interface SyncConfigData {
    vaultId: string;
    vaultName: string;
}

export interface PendingChange {
    path: string;
    type: "create" | "modify" | "delete" | "rename";
    oldPath?: string;
    isRemote: boolean;
    timestamp: number;
}

export type SyncStatus = "idle" | "pushing" | "pulling" | "error" | "locked";

export const VIEW_TYPE_DASHBOARD = "supsync-dashboard";
