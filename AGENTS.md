# SupSync — Session Summary (2026-06-14)

## Project
SupSync v0.7.0 — Obsidian plugin for multi-user vault sync via Supabase with real-time locking.
GitHub: https://github.com/jaliriogbarrios19/SupSync

## Supabase Config
- Project: `vhyxgyseywbjmphpyujx.supabase.co`
- Vault: `test-manual` (ID: `858effb5-6399-4646-b868-a7b2bcd82534`)
- User: `jaliriogbarrios@gmail.com` (ID: `a210ee94-52d5-4ef2-a7e3-be7c8556ce90`)
- Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeXhneXNleXdiam1waHB5dWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg0NzY2MywiZXhwIjoyMDk2NDIzNjYzfQ.9qrsewrdeJ6_ti9jdxUnEzaiP6JYGhFZWQqsSNY8TAY`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeXhneXNleXdiam1waHB5dWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDc2NjMsImV4cCI6MjA5NjQyMzY2M30.egz9Id7Wh0Z06THNGq_zcjbG4BtFXIqa2PLVVvgkFOc`

## Vaults
- Laptop (desktop): `D:\Obsidian Files\Jesús` — main vault, has content
- Mobile (iOS): same vault config — sync not yet working fully

## What was built this session

### Features
1. **Exclusion picker** (v0.5.0): modal with vault tree view, lazy-loading, glob support
2. **Auth persistence** (v0.5.1-v0.5.3): tokens in data.json, refreshAccessToken(), auto-refresh
3. **Login in settings** (v0.5.1): email/password form inline, sign-up/sign-in
4. **Join/Create vault in settings** (v0.6.0): no need for command palette or modal
5. **Vault ID display** (v0.6.2): copy button to share with team

### Bugfixes
1. **RLS notes policies** (v0.5.6): removed lock requirement for insert/update/delete — was blocking all text note sync
2. **joinVault UUID** (v0.6.1): was sending `"auth.uid()"` string instead of real UUID
3. **Vault config loading** (v0.5.3): added `adapter.exists()` fallback for mobile
4. **checkAuth crash** (v0.5.5): silent crash made settings blank on mobile
5. **onAuthSuccess vault** (v0.5.5): didn't load vault config if user signed in first
6. **Obsidian bot warnings** (v0.5.4): CSS, type assertions, void promises

## What was built this session (v0.7.0)

### Features
1. **maxFileSizeMB setting** (v0.7.0): configurable file size limit, default 50MB, 0 = no limit
2. **Binary exclusion support**: pull now respects excludedPaths (previously only push did)
3. **fullSync initial scan**: scans all local files and pushes them on first sync
4. **CI release workflow**: `.github/workflows/release.yml` — auto-builds and releases on tag push

### Bugfixes
1. **RLS vaults_select**: changed from `is_vault_member(id)` to `auth.uid() IS NOT NULL` — was blocking joinVault
2. **RLS members_insert_self**: changed from `supsync_uid()` to `auth.uid()` — supsync_uid() fails in RLS context
3. **RLS members_select**: added `OR user_id = auth.uid()` — users couldn't see own membership
4. **joinVault 409 Conflict**: now handles "already a member" gracefully instead of throwing
5. **Storage encoding**: `encodeURIComponent` was encoding `/` in paths — now encodes per-segment
6. **Unicode in storage paths**: sanitized to hex codes to avoid 400 errors from Supabase Storage
7. **Binary parent folders**: `ensureParentFolders()` creates directories before writing files
8. **Storage upload method**: changed from POST to PUT for proper upsert
9. **upsert Prefer header**: added `resolution=merge-duplicates` for PostgREST upserts
10. **Review compliance**: replaced `createEl("h3")` with CSS classes

## Known Issues (for next session)
1. **Mobile "request failed" when joining vault** — still happening, root cause unknown.
2. **_refreshToken truncated** — sometimes shows as short string instead of full JWT.
3. **Jesús vault uses old plugin ID** `obsidian-sup-sync` — should migrate to `supsync`.
4. **ERR_CONNECTION_RESET on large WAV files** — transient network issue, retry helps but files >50MB are skipped.

## Dev Workflow
- Project: `D:\Obsidian Files\Projects\SupSync`
- Vaults: Jesús (`D:\Obsidian Files\Jesús`) and pruebas (`D:\Obsidian pruebas`)
- Build: `npm run build` → copies to vaults with `Copy-Item`
- Release: bump manifest.json + versions.json + package.json → `git tag 0.x.y` → CI creates release
- Tags: no `v` prefix (Obsidian requirement)
- Assets: `main.js`, `manifest.json`, `styles.css` only
- CI: `.github/workflows/release.yml` auto-builds on tag push
