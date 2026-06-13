# SupSync — Session Summary (2026-06-12/13)

## Project
SupSync v0.6.2 — Obsidian plugin for multi-user vault sync via Supabase with real-time locking.
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

## Known Issues (for next session)
1. **Mobile "request failed" when joining vault** — still happening, root cause unknown. `joinVault()` call in settings throws an error that reaches the catch handler. The Supabase API calls may be failing due to network/auth issues on mobile.
2. **_refreshToken truncated** — sometimes shows as `"43kc46dyui4s"` (short string) instead of a full JWT. Maybe `saveTokens` callback is being called before signIn completes, or the `persistTokens` callback writes partial data.
3. Mobile login section occasionally doesn't render — may be timing issue with `checkAuth()`.
4. No notes in Supabase after "sync complete" on laptop—was RLS issue (fixed in v0.5.6), needs re-testing.

## Dev Workflow
- Project: `D:\Obsidian Files\Projects\SupSync`
- Vault: `D:\Obsidian Files\Jesús`
- Build: `npm run build` → copies to vault with `Copy-Item main.js, manifest.json, styles.css`
- Release: bump manifest.json + versions.json + package.json → `git tag 0.x.y` → CI creates release
- Tags: no `v` prefix (Obsidian requirement)
- Assets: `main.js`, `manifest.json`, `styles.css` only
