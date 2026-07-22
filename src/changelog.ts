export interface ChangelogEntry {
    version: string;
    date: string;
    changes: {
        type: "feature" | "fix" | "improvement";
        text: string;
    }[];
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "0.7.9",
        date: "2026-07-22",
        changes: [
            { type: "fix", text: "Removed unnecessary console logging flagged by review bot" },
            { type: "improvement", text: "Settings now appear in Obsidian's settings search (1.13.0+)" },
        ],
    },
    {
        version: "0.7.8",
        date: "2026-07-22",
        changes: [
            { type: "fix", text: "Login no longer lost on temporary network failures — refresh token persists across restarts" },
            { type: "fix", text: "Session restore retries with backoff instead of failing immediately" },
            { type: "improvement", text: "Settings changes no longer risk overwriting stored auth tokens" },
        ],
    },
    {
        version: "0.7.7",
        date: "2026-07-15",
        changes: [
            { type: "fix", text: "Auth tokens no longer get lost — expired refresh tokens are cleared from storage and session auto-recovers" },
            { type: "feature", text: "Auto-sync: remote changes are pulled automatically after each local push" },
            { type: "feature", text: "Periodic session health check (every 30 min) keeps tokens alive and auto-reconnects on expiry" },
            { type: "improvement", text: "New 'Auto-sync' toggle in settings (enabled by default)" },
        ],
    },
    {
        version: "0.7.4",
        date: "2026-06-14",
        changes: [
            { type: "fix", text: "Fixed session not persisting across Obsidian restarts — auto refresh expired tokens" },
        ],
    },
    {
        version: "0.7.3",
        date: "2026-06-14",
        changes: [
            { type: "improvement", text: "Updated spob URL to spob.fly.dev" },
            { type: "feature", text: "Added 'More about our work' link in settings" },
        ],
    },
    {
        version: "0.7.2",
        date: "2026-06-14",
        changes: [
            { type: "feature", text: "What's New modal — shows changelog on plugin update" },
            { type: "fix", text: "Updated SQL setup script with correct RLS policies for new installations" },
            { type: "fix", text: "Fixed typo in Spanish onboarding text" },
        ],
    },
    {
        version: "0.7.1",
        date: "2026-06-14",
        changes: [
            { type: "fix", text: "Fixed Obsidian review bot warning about regex control characters" },
            { type: "fix", text: "Updated SQL setup script with correct RLS policies" },
        ],
    },
    {
        version: "0.7.0",
        date: "2026-06-14",
        changes: [
            { type: "feature", text: "Configurable max file size limit (default 50MB)" },
            { type: "feature", text: "Binary file exclusion support in pull sync" },
            { type: "feature", text: "Full initial sync — scans and pushes all local files" },
            { type: "feature", text: "CI release workflow for automatic builds" },
            { type: "fix", text: "Fixed RLS policies for vault joining flow" },
            { type: "fix", text: "Fixed storage encoding for Unicode paths" },
            { type: "fix", text: "Fixed binary file parent folder creation" },
            { type: "fix", text: "Fixed upsert with proper Prefer header" },
        ],
    },
    {
        version: "0.6.2",
        date: "2026-06-13",
        changes: [
            { type: "feature", text: "Vault ID display with copy button in settings" },
            { type: "fix", text: "Fixed clipboard promise warning" },
        ],
    },
    {
        version: "0.6.0",
        date: "2026-06-13",
        changes: [
            { type: "feature", text: "Join/Create vault directly in settings tab" },
            { type: "fix", text: "Fixed joinVault sending literal 'auth.uid()' string" },
        ],
    },
    {
        version: "0.5.6",
        date: "2026-06-12",
        changes: [
            { type: "fix", text: "Removed lock requirement from notes RLS policies" },
            { type: "fix", text: "Fixed vault config loading on mobile" },
            { type: "fix", text: "Fixed blank settings on auth failure" },
        ],
    },
    {
        version: "0.5.0",
        date: "2026-06-12",
        changes: [
            { type: "feature", text: "Exclusion picker with vault tree view and glob support" },
            { type: "feature", text: "Auth token persistence and auto-refresh" },
            { type: "feature", text: "Login form in settings" },
        ],
    },
];
