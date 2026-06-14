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
