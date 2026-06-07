# SupSync

Multi-user Obsidian vault sync via [Supabase](https://supabase.com) with real-time collaboration and file locking.

## Features

- **Real-time sync** — notes, canvases, Excalidraw drawings, images, PDFs, and audio files
- **File locking** — automatic lock acquisition when editing, with heartbeat and idle timeout
- **Conflict resolution** — side-by-side diff modal when the same file is modified locally and remotely
- **Binary file support** — images, PDFs, and audio synced via Supabase Storage
- **Multi-language** — English and Spanish, auto-detected from Obsidian settings
- **Multi-user vaults** — create a vault and invite team members by sharing a Vault ID
- **Onboarding wizard** — step-by-step guide to set up Supabase from scratch

## Supported file types

| Type | Extensions |
|------|-----------|
| Text | `.md`, `.canvas`, `.excalidraw` |
| Images | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg` |
| Documents | `.pdf` |
| Audio | `.mp3`, `.wav`, `.ogg`, `.m4a` |

## Quick start

### 1. Install the plugin

Install from Obsidian Community Plugins, or copy `main.js`, `manifest.json`, and `styles.css` to `.obsidian/plugins/supsync/`.

### 2. Set up Supabase

1. Create a [Supabase](https://supabase.com) project (free tier works)
2. Run the SQL setup: open the **SupSync: Open setup wizard** — the SQL is embedded in Step 2 with a **Copy SQL** button. Paste it into your Supabase project's SQL Editor and run.
3. Create a Storage bucket named `vault-files` (public)
4. Add bucket policies: SELECT, INSERT, DELETE for authenticated users
5. Copy your Project URL and anon key

### 3. Configure the plugin

1. Open Settings → Community Plugins → SupSync
2. Paste your Supabase URL and anon key
3. Run the command **SupSync: Open setup wizard** for guided setup

### 4. Create or join a vault

- **First time**: run **SupSync: Create shared vault**
- **Joining**: run **SupSync: Join vault** and enter the Vault ID from your admin

### 5. Sync

Run **SupSync: Sync now** or click the refresh icon in the ribbon.

## How locking works

When you start editing a note, SupSync acquires a lock so others see "X is editing this note". The lock releases when you:

- Close the note
- Stop typing for 2 minutes
- Switch to a different note

Reading is always available — no lock needed.

## Commands

| Command | Description |
|---------|-------------|
| SupSync: Sync now | Push/pull changes immediately |
| SupSync: Sign in | Authenticate with email/password |
| SupSync: Sign out | Disconnect from Supabase |
| SupSync: Create shared vault | Register this vault in Supabase |
| SupSync: Join vault | Join an existing vault by ID |
| SupSync: Open setup wizard | Guided Supabase setup |
| SupSync: Open settings | Open plugin settings |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Supabase URL | — | Your project URL |
| Supabase anon key | — | Public API key |
| Sync interval (ms) | `0` | Auto-sync interval (0 = manual only) |
| Conflict mode | Remote wins | `local-wins`, `remote-wins`, or `ask` |
| Excluded paths | `.git/`, `.obsidian/`, `.trash/` | Paths to skip during sync |
| Storage limit (MB) | 1024 | Max file size for binary uploads |

## Development

```bash
npm install
npm run dev        # watch mode
npm run build      # production build
npm run typecheck  # type verification
npm test           # run tests
```

## Releasing

Push a tag without `v` prefix — the CI workflow builds, attests, and creates the GitHub release automatically:

```bash
git tag 0.2.0
git push origin 0.2.0
```

## Architecture

```
src/
  main.ts            Plugin entry point, commands, session restore
  settings.ts        Settings tab UI
  types.ts           Shared types and constants
  i18n/
    index.ts         Locale loader and t() function
    en.json          English strings
    es.json          Spanish strings
  supabase-client.ts Auth, REST helpers, storage upload/download
  supabase-api.ts    Vault CRUD operations
  sync-manager.ts    Change queue, polling, push/pull orchestration
  sync-pull.ts       Pull logic with conflict detection
  binary-sync.ts     Binary file upload/download via Storage
  lock-manager.ts    Lock acquisition, heartbeat, release
  realtime-manager.ts WebSocket connection for lock notifications
  conflict-modal.ts  Side-by-side diff for conflict resolution
  login-modal.ts     Sign in / register modal
  join-vault-modal.ts Join existing vault modal
  onboard-modal.ts   Step-by-step setup wizard
sql/
  setup.sql          Supabase schema, RLS policies, triggers
```

### Adding a new language

1. Copy `src/i18n/en.json` to `src/i18n/<lang>.json` (use the [Obsidian language code](https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages))
2. Translate all values
3. Import and register it in `src/i18n/index.ts`

## License

MIT
