# SupSync — Workflow de Sincronización

Guía práctica para sincronizar un vault de Obsidian entre dispositivos vía Supabase.

## Requisitos previos

- Una cuenta en [Supabase](https://supabase.com) (plan free)
- Obsidian instalado en ambos dispositivos (desktop + mobile)
- El vault local ya existe en al menos un dispositivo

---

## Paso 1 — Crear proyecto Supabase (una sola vez)

1. Andá a [supabase.com](https://supabase.com) → **New project**
2. Completá: nombre, contraseña de DB (guardala), región cercana, plan **Free**
3. Esperá ~2 minutos a que provisione

## Paso 2 — Ejecutar el SQL de setup (una sola vez)

1. Dashboard → **SQL Editor** → **New query**
2. Abrí el asistente del plugin: **Ctrl+P → SupSync: Open setup wizard** → Paso 2
3. Clic en **Copiar SQL** → pegalo en el SQL Editor → **Run**
4. Debe decir "Success. No rows returned."

## Paso 3 — Crear bucket de Storage (una sola vez)

1. Dashboard → **Storage** → **New bucket**
2. Nombre: `vault-files` (exacto, sin mayúsculas)
3. **Tildar Public bucket** → desmarcar Restrict file size / MIME types
4. En la pestaña **Policies** del bucket, agregar 3 políticas:

| Operación | Roles        | Expresión                        |
|-----------|-------------|----------------------------------|
| SELECT    | authenticated | `bucket_id = 'vault-files'`     |
| INSERT    | authenticated | `bucket_id = 'vault-files'`     |
| DELETE    | authenticated | `bucket_id = 'vault-files'`     |

## Paso 4 — Configurar credenciales en el plugin (cada dispositivo)

1. Dashboard → **Settings** → **API**
2. Copiá la **Project URL** (ej: `https://abcxyz.supabase.co`)
3. Copiá la **anon public key** (la larga que empieza con `eyJ...`, **NO** la `service_role`)
4. En Obsidian: **Settings → Community Plugins → SupSync** → pegá ambas

> ⚠️ Si solo ves una key `sb_publishable_...`, buscá el toggle **"Show JWT keys"** en la misma página. La publishable key no funciona con este plugin.

## Paso 5 — Autenticación (cada dispositivo)

1. Dashboard → **Authentication** → **Providers** → **Email**
2. **Desactivar "Confirm email"** (para desarrollo; en producción dejalo activado)
3. En Obsidian: **Ctrl+P → SupSync: Sign in**
   - Primera vez: **Crear cuenta** → registrate con email y contraseña
   - Después: **Iniciar sesión** con ese mismo email y contraseña

## Paso 6 — Crear o unirse al vault

### Dispositivo 1 (admin, el que tiene las notas originales)

1. **Ctrl+P → SupSync: Create shared vault**
2. Se genera un UUID en `.supsync-config.json` en la raíz del vault
3. **Ctrl+P → SupSync: Sync now** → pushea todas las notas a Supabase

### Dispositivo 2 (se une al vault existente)

1. Copiá el vault localmente (copiá la carpeta entera del vault al celu)
2. Instalá SupSync, configurá URL y anon key, iniciá sesión con **la misma cuenta**
3. Necesitás el Vault ID del admin. Está en `.supsync-config.json`:
   ```json
   { "vaultId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "vaultName": "..." }
   ```
4. **Ctrl+P → SupSync: Join vault** → pegá el Vault ID
5. **Ctrl+P → SupSync: Sync now** → baja todas las notas

## Paso 7 — Sincronización diaria

- **Manual**: Ctrl+P → SupSync: Sync now (o clic en el ícono de la ribbon)
- **Automática**: Configurá `syncInterval` en settings (minutos, 0 = manual)

## Qué se sincroniza

| Tipo       | Extensiones                                              |
|------------|----------------------------------------------------------|
| Notas      | `.md`                                                    |
| Canvas     | `.canvas`                                                |
| Excalidraw | `.excalidraw`                                            |
| Imágenes   | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`        |
| PDF        | `.pdf`                                                   |
| Audio      | `.mp3`, `.wav`, `.ogg`, `.m4a`                           |

## Qué NO se sincroniza

- Carpeta `.obsidian/` (configuración, temas, plugins — cada dispositivo la suya)
- `.git/`, `.trash/`, `.DS_Store`, `Thumbs.db`
- Paths personalizados en settings → Excluded paths

## Resolución de conflictos

Configurable en settings:

| Modo          | Comportamiento                                    |
|---------------|---------------------------------------------------|
| Remote wins   | Siempre gana la versión del servidor              |
| Local wins    | Siempre gana la versión local                     |
| Ask           | Modal side-by-side para elegir manualmente        |

## Solución de problemas

### "Sign in first" al hacer sync
→ La sesión expiró. Volvé a hacer Sign in.

### "Set up your vault first" al hacer sync
→ No ejecutaste Create shared vault, o el `.supsync-config.json` no existe.

### Error 500 al crear vault
→ El SQL de setup no se ejecutó correctamente. Revisá que las tablas existan en Table Editor.

### Error 403 al crear vault
→ `auth.uid()` no se propaga al trigger. Asegurate de usar la versión 0.4.3+ del SQL.

### Error 401
→ La anon key es incorrecta o expiró. Verificá que sea la JWT (`eyJ...`), no la publishable (`sb_publishable_...`).
