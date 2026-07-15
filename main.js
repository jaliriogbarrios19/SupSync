"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SupSyncPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian16 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  syncInterval: 0,
  conflictMode: "latest-wins",
  excludedPaths: [".git/", ".trash/", ".DS_Store", "Thumbs.db"],
  storageLimitMB: 1024,
  maxFileSizeMB: 50,
  lastSeenVersion: "",
  autoSyncEnabled: true
};
var DEBOUNCE_MS = 500;
var LOCK_HEARTBEAT_MS = 3e4;
var STORAGE_WARNING_THRESHOLD = 0.8;
var SYNCABLE_TEXT_EXTENSIONS = [".md", ".canvas", ".excalidraw"];
var SYNCABLE_BINARY_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".pdf",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a"
];
var SYNCABLE_ALL_EXTENSIONS = [
  ...SYNCABLE_TEXT_EXTENSIONS,
  ...SYNCABLE_BINARY_EXTENSIONS
];
var VIEW_TYPE_DASHBOARD = "supsync-dashboard";

// src/settings.ts
var import_obsidian4 = require("obsidian");

// src/i18n/index.ts
var import_obsidian = require("obsidian");

// src/i18n/en.json
var en_default = {
  "plugin.name": "SupSync",
  "plugin.connected": "SupSync: Connected as {email} to {vault}",
  "plugin.joined": "SupSync: Joined '{vault}'!",
  "plugin.vaultCreated": "SupSync: Vault '{name}' created! Share with your team.",
  "plugin.vaultCreateFailed": "SupSync: Failed to create vault: {error}",
  "plugin.setupFirst": "SupSync: Set up your vault first. Use the setup wizard.",
  "plugin.signInFirst": "SupSync: Sign in first.",
  "plugin.signedOut": "SupSync: Signed out.",
  "plugin.signInPrompt": "SupSync: Signed in as {email}. Use 'Create shared vault' or 'Join vault'.",
  "plugin.syncComplete": "SupSync: Sync complete.",
  "plugin.syncFailed": "SupSync: Sync failed. Check console for details.",
  "sync.starting": "SupSync: Starting sync...",
  "sync.progress": "SupSync: Syncing {current}/{total} files",
  "plugin.pleaseSignIn": "SupSync: Please sign in first.",
  "plugin.verifyLogin": "SupSync: Could not verify login.",
  "plugin.storageWarning": "SupSync: Storage {used}/{limit} MB ({pct}%). Less than 20% remaining.",
  "plugin.isEditing": "SupSync: {user} is editing {path}",
  "plugin.lockAcquired": "SupSync: Lock acquired on {path}",
  "plugin.lockReleased": "SupSync: {path} is now free to edit",
  "plugin.lostLock": "Lost lock on {path}",
  "status.errors": "Sync errors ({count})",
  "cmd.syncNow": "Sync now",
  "cmd.signIn": "Sign in",
  "cmd.signOut": "Sign out",
  "cmd.createVault": "Create shared vault",
  "cmd.joinVault": "Join vault",
  "cmd.openWizard": "Open setup wizard",
  "cmd.openSettings": "Open settings",
  "settings.heading.supabase": "Supabase Project",
  "settings.heading.account": "Account",
  "settings.auth.signedIn": "Signed in",
  "settings.auth.signOut": "Sign out",
  "settings.url": "Project URL",
  "settings.url.desc": "The URL of your Supabase project (e.g., https://abcxyz.supabase.co)",
  "settings.url.placeholder": "https://your-project.supabase.co",
  "settings.anonKey": "Anon Key",
  "settings.anonKey.desc": "Your Supabase project's anon/public key",
  "settings.anonKey.placeholder": "eyJhbGciOi...",
  "settings.heading.sync": "Sync",
  "settings.syncInterval": "Sync interval (minutes)",
  "settings.syncInterval.desc": "0 = manual sync only. Polling interval for changes from server.",
  "settings.syncInterval.placeholder": "0",
  "settings.conflictMode": "Conflict resolution",
  "settings.conflictMode.desc": "What happens when local and remote versions of the same note differ.",
  "settings.conflictMode.local": "Local wins",
  "settings.conflictMode.remote": "Remote wins",
  "settings.conflictMode.latest": "Latest wins",
  "settings.conflictMode.ask": "Ask every time",
  "settings.storageLimit": "Storage limit (MB)",
  "settings.storageLimit.desc": "Warning threshold is set at 80% of this value. Free tier: 1024 MB.",
  "settings.storageLimit.placeholder": "1024",
  "settings.maxFileSize": "Max file size (MB)",
  "settings.maxFileSize.desc": "Files larger than this won't be synced. Free plan: 50 MB max. Set 0 for no limit.",
  "settings.maxFileSize.placeholder": "50",
  "settings.autoSync": "Auto-sync",
  "settings.autoSync.desc": "Automatically sync when files change. When enabled, remote changes are also pulled after each local push.",
  "settings.heading.excluded": "Excluded paths",
  "settings.excludedPaths": "Paths to skip",
  "settings.excludedPaths.desc": "Files and folders excluded from sync. Supports glob patterns like folder/** and *.secret.md.",
  "settings.excludedPaths.placeholder": ".git/, .trash/, .DS_Store, Thumbs.db",
  "settings.excludedPaths.browse": "Browse vault",
  "settings.excludedPaths.clearAll": "Clear all",
  "settings.excludedPaths.empty": "No paths excluded.",
  "settings.heading.vaultSelect": "Join or create a vault",
  "settings.heading.vault": "Your vault",
  "settings.vault.unnamed": "Unnamed vault",
  "settings.vault.id": "Vault ID: {id}",
  "settings.vault.copyId": "Copy ID",
  "settings.vault.copied": "Vault ID copied!",
  "settings.joinVault.label": "Vault ID",
  "settings.joinVault.placeholder": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "settings.joinVault.join": "Join vault",
  "settings.joinVault.create": "Create new vault",
  "settings.joinVault.joining": "Joining vault...",
  "settings.joinVault.creating": "Creating vault...",
  "settings.joinVault.success": "Vault connected!",
  "settings.joinVault.created": "Vault created!",
  "settings.joinVault.emptyError": "Please enter a vault ID.",
  "settings.joinVault.error": "Could not join vault. Check the ID and try again.",
  "settings.setupWizard": "Setup Wizard",
  "settings.setupWizard.desc": "Walk through the step-by-step setup to connect this vault to Supabase.",
  "settings.setupWizard.btn": "Open setup wizard",
  "settings.syncNow": "Sync now",
  "settings.syncNow.desc": "Force a full sync with the server.",
  "settings.syncNow.btn": "Sync now",
  "dashboard.title": "SupSync",
  "dashboard.vault": "Vault: {name}",
  "dashboard.syncNow": "Sync",
  "dashboard.fullSync": "Full sync",
  "conflict.title": "Sync conflict",
  "exclusionPicker.title": "Select files and folders to exclude",
  "exclusionPicker.description": "Check the files and folders you want to exclude from sync.",
  "exclusionPicker.cancel": "Cancel",
  "exclusionPicker.confirm": "Add selected",
  "conflict.description": "{path} was modified both locally and remotely.",
  "conflict.keepLocal": "Keep local version",
  "conflict.keepRemote": "Keep remote version",
  "conflict.skip": "Skip for now",
  "conflict.labelLocal": "Local",
  "conflict.labelRemote": "Remote",
  "conflict.empty": "(empty)",
  "conflict.moreLines": "... and {count} more lines",
  "login.title.signIn": "Sign in to SupSync",
  "login.title.register": "Create account",
  "login.email": "Email",
  "login.email.placeholder": "you@example.com",
  "login.password": "Password",
  "login.password.placeholder": "Your password",
  "login.btn.signIn": "Sign in",
  "login.btn.register": "Register",
  "login.btn.toggleIn": "Create account",
  "login.btn.toggleOut": "Sign in instead",
  "login.btn.cancel": "Cancel",
  "login.error.fillFields": "Please fill in both fields.",
  "login.waiting": "Please wait...",
  "login.success.created": "Account created! Check your email for confirmation, then sign in.",
  "login.success.signedIn": "Signed in!",
  "login.error.failed": "Authentication failed",
  "join.title": "Join a shared vault",
  "join.description": "Ask your vault admin for the Vault ID. You can find it in the vault's .supsync-config.json file.",
  "join.label": "Vault ID",
  "join.placeholder": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "join.btn.join": "Join vault",
  "join.btn.cancel": "Cancel",
  "join.error.emptyId": "Please enter a Vault ID.",
  "join.joining": "Joining vault...",
  "join.error.notFound": "Vault not found. Check the ID and try again.",
  "join.success": "Joined '{vault}'!",
  "onboard.progress": "Step {current} of {total}",
  "onboard.btn.back": "Back",
  "onboard.btn.next": "Next",
  "onboard.btn.done": "Done",
  "onboard.step1.title": "Welcome to SupSync",
  "onboard.step1.p1": "SupSync lets you share an Obsidian vault with your team using Supabase for real-time sync and locking.",
  "onboard.step1.p2": "This wizard will guide you through setting up Supabase and connecting your vault.",
  "onboard.step1.p3": "Estimated time: 10 minutes.",
  "onboard.step2.title": "Step 1: Create a Supabase project",
  "onboard.step2.p1": "Go to https://supabase.com and sign up (or sign in).",
  "onboard.step2.p2": 'Click "New project" and fill in:',
  "onboard.step2.li1": "Name: anything you like (e.g., my-team-vault)",
  "onboard.step2.li2": "Database password: pick a strong one and save it",
  "onboard.step2.li3": "Region: pick one close to your team",
  "onboard.step2.li4": "Pricing plan: Free works for up to 500 MB database and 1 GB storage",
  "onboard.step2.p3": "Click Create project and wait ~2 minutes for provisioning.",
  "onboard.step3.title": "Step 2: Run the SQL setup",
  "onboard.step3.p1": "In your Supabase dashboard (https://supabase.com/dashboard), select your project.",
  "onboard.step3.p2": "Open the SQL Editor (left sidebar \u2192 SQL Editor).",
  "onboard.step3.p3": "The SQL setup script is shown below. Click 'Copy SQL' and paste it into the SQL Editor.",
  "onboard.step3.copySql": "Copy SQL",
  "onboard.step3.sqlCopied": "SQL copied!",
  "onboard.step3.p5": 'Click "Run" (or Ctrl+Enter). You should see "Success. No rows returned."',
  "onboard.step3.p6": "This creates all tables, indexes, RLS policies, and triggers needed for sync.",
  "onboard.step4.title": "Step 3: Create the Storage bucket",
  "onboard.step4.p1": "Go to Storage in the left sidebar of your Supabase dashboard.",
  "onboard.step4.p2": 'Click "New bucket" and name it: vault-files',
  "onboard.step4.p3": "Check: Public bucket (files need to be accessible for download by team members).",
  "onboard.step4.p4": "Under bucket Policies, add these policies:",
  "onboard.step4.li1": "SELECT: Allow authenticated users to read (bucket_id = 'vault-files')",
  "onboard.step4.li2": "INSERT: Allow authenticated users to upload (bucket_id = 'vault-files')",
  "onboard.step4.li3": "DELETE: Allow authenticated users to delete (bucket_id = 'vault-files')",
  "onboard.step5.title": "Step 4: Connect the plugin",
  "onboard.step5.p1": "Go to your Supabase project dashboard \u2192 Settings \u2192 API.",
  "onboard.step5.p2": "Copy the Project URL (https://your-project.supabase.co).",
  "onboard.step5.p3": "Copy the anon/public key (NOT the secret service_role key).",
  "onboard.step5.p4": "Paste both into the plugin settings (Settings \u2192 Community Plugins \u2192 SupSync).",
  "onboard.step5.p5": "Run the command 'SupSync: Setup vault' from the command palette.",
  "onboard.step6.title": "Step 5: Create or join a vault",
  "onboard.step6.p1": "If this is the FIRST time setting up this vault:",
  "onboard.step6.p2": "Use the command 'SupSync: Create shared vault' to register this vault in Supabase as an admin.",
  "onboard.step6.p3": "If you're JOINING an existing vault:",
  "onboard.step6.p4": "Use the command 'SupSync: Join vault' and enter the vault ID shared by your admin.",
  "onboard.step6.p5": "Share the vault folder with your team (via syncthing, Google Drive, git, or any file sync tool).",
  "onboard.step7.title": "Step 6: Sync for the first time",
  "onboard.step7.p1": "Sign in with 'SupSync: Sign in' command (create an account if needed).",
  "onboard.step7.p2": "Run 'SupSync: Sync now' to pull all existing notes from the vault.",
  "onboard.step7.p3": "That's it! You're now syncing.",
  "onboard.step7.p4": "What gets synced:",
  "onboard.step7.li1": ".md \u2014 notes",
  "onboard.step7.li2": ".canvas \u2014 canvases",
  "onboard.step7.li3": ".excalidraw \u2014 Excalidraw drawings",
  "onboard.step7.li4": ".png, .jpg, .webp, .gif, .svg \u2014 images",
  "onboard.step7.li5": ".pdf \u2014 PDF documents",
  "onboard.step7.li6": ".mp3, .wav, .ogg, .m4a \u2014 audio files",
  "onboard.step8.title": "How locking works",
  "onboard.step8.p1": "When you start editing a note, SupSync acquires a lock so nobody else can edit it at the same time.",
  "onboard.step8.p2": "If someone else tries to edit it, they'll see a banner: 'X is editing this note'.",
  "onboard.step8.p3": "The lock releases automatically when you:",
  "onboard.step8.li1": "Close the note",
  "onboard.step8.li2": "Stop typing for 2 minutes",
  "onboard.step8.li3": "Switch to a different note",
  "onboard.step8.p4": "For reading-only, no lock is needed. Anyone can read any note at any time.",
  "whatsNew.title": "What's New in SupSync",
  "whatsNew.subtitle": "Version {version}",
  "whatsNew.close": "Got it",
  "whatsNew.type.feature": "New",
  "whatsNew.type.fix": "Fix",
  "whatsNew.type.improvement": "Improvement"
};

// src/i18n/es.json
var es_default = {
  "plugin.name": "SupSync",
  "plugin.connected": "SupSync: Conectado como {email} en {vault}",
  "plugin.joined": "SupSync: Te uniste a '{vault}'!",
  "plugin.vaultCreated": "SupSync: Vault '{name}' creado! Compartilo con tu equipo.",
  "plugin.vaultCreateFailed": "SupSync: Error al crear vault: {error}",
  "plugin.setupFirst": "SupSync: Configur\xE1 tu vault primero. Us\xE1 el asistente de setup.",
  "plugin.signInFirst": "SupSync: Inici\xE1 sesi\xF3n primero.",
  "plugin.signedOut": "SupSync: Sesi\xF3n cerrada.",
  "plugin.signInPrompt": "SupSync: Sesi\xF3n iniciada como {email}. Us\xE1 'Crear vault compartido' o 'Unirse a vault'.",
  "plugin.syncComplete": "SupSync: Sincronizaci\xF3n completa.",
  "plugin.syncFailed": "SupSync: Error de sincronizaci\xF3n. Revis\xE1 la consola.",
  "sync.starting": "SupSync: Iniciando sync...",
  "sync.progress": "SupSync: Sincronizando {current}/{total} archivos",
  "plugin.pleaseSignIn": "SupSync: Por favor inici\xE1 sesi\xF3n primero.",
  "plugin.verifyLogin": "SupSync: No se pudo verificar el login.",
  "plugin.storageWarning": "SupSync: Almacenamiento {used}/{limit} MB ({pct}%). Queda menos del 20%.",
  "plugin.isEditing": "SupSync: {user} est\xE1 editando {path}",
  "plugin.lockAcquired": "SupSync: Lock adquirido en {path}",
  "plugin.lockReleased": "SupSync: {path} ahora est\xE1 libre para editar",
  "plugin.lostLock": "Se perdi\xF3 el lock en {path}",
  "status.errors": "Errores de sync ({count})",
  "cmd.syncNow": "Sincronizar ahora",
  "cmd.signIn": "Iniciar sesi\xF3n",
  "cmd.signOut": "Cerrar sesi\xF3n",
  "cmd.createVault": "Crear vault compartido",
  "cmd.joinVault": "Unirse a vault",
  "cmd.openWizard": "Abrir asistente de setup",
  "cmd.openSettings": "Abrir configuraci\xF3n",
  "settings.heading.supabase": "Proyecto Supabase",
  "settings.heading.account": "Cuenta",
  "settings.auth.signedIn": "Sesi\xF3n iniciada",
  "settings.auth.signOut": "Cerrar sesi\xF3n",
  "settings.url": "URL del proyecto",
  "settings.url.desc": "La URL de tu proyecto Supabase (ej: https://abcxyz.supabase.co)",
  "settings.url.placeholder": "https://tu-proyecto.supabase.co",
  "settings.anonKey": "Clave an\xF3nima",
  "settings.anonKey.desc": "La clave p\xFAblica/an\xF3nima de tu proyecto Supabase",
  "settings.anonKey.placeholder": "eyJhbGciOi...",
  "settings.heading.sync": "Sincronizaci\xF3n",
  "settings.syncInterval": "Intervalo de sync (minutos)",
  "settings.syncInterval.desc": "0 = solo sync manual. Intervalo de polling para cambios del servidor.",
  "settings.syncInterval.placeholder": "0",
  "settings.conflictMode": "Resoluci\xF3n de conflictos",
  "settings.conflictMode.desc": "Qu\xE9 pasa cuando la versi\xF3n local y remota de una nota difieren.",
  "settings.conflictMode.local": "Gana la local",
  "settings.conflictMode.remote": "Gana la remota",
  "settings.conflictMode.latest": "Gana el m\xE1s reciente",
  "settings.conflictMode.ask": "Preguntar siempre",
  "settings.storageLimit": "L\xEDmite de almacenamiento (MB)",
  "settings.storageLimit.desc": "El umbral de advertencia es al 80% de este valor. Plan free: 1024 MB.",
  "settings.storageLimit.placeholder": "1024",
  "settings.maxFileSize": "Tama\xF1o m\xE1ximo de archivo (MB)",
  "settings.maxFileSize.desc": "Archivos m\xE1s grandes que esto no se sincronizan. Plan free: 50 MB max. Pon\xE9 0 para no tener l\xEDmite.",
  "settings.maxFileSize.placeholder": "50",
  "settings.autoSync": "Auto-sync",
  "settings.autoSync.desc": "Sincronizar autom\xE1ticamente cuando cambian los archivos. Cuando est\xE1 activo, los cambios remotos tambi\xE9n se bajan despu\xE9s de cada push local.",
  "settings.heading.excluded": "Rutas excluidas",
  "settings.excludedPaths": "Rutas a omitir",
  "settings.excludedPaths.desc": "Archivos y carpetas excluidos del sync. Soporta patrones glob como folder/** y *.secret.md.",
  "settings.excludedPaths.placeholder": ".git/, .trash/, .DS_Store, Thumbs.db",
  "settings.excludedPaths.browse": "Explorar vault",
  "settings.excludedPaths.clearAll": "Limpiar todo",
  "settings.excludedPaths.empty": "No hay rutas excluidas.",
  "settings.heading.vaultSelect": "Unirse o crear un vault",
  "settings.heading.vault": "Tu vault",
  "settings.vault.unnamed": "Vault sin nombre",
  "settings.vault.id": "Vault ID: {id}",
  "settings.vault.copyId": "Copiar ID",
  "settings.vault.copied": "\xA1Vault ID copiado!",
  "settings.joinVault.label": "Vault ID",
  "settings.joinVault.placeholder": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "settings.joinVault.join": "Unirse al vault",
  "settings.joinVault.create": "Crear nuevo vault",
  "settings.joinVault.joining": "Uni\xE9ndose al vault...",
  "settings.joinVault.creating": "Creando vault...",
  "settings.joinVault.success": "\xA1Vault conectado!",
  "settings.joinVault.created": "\xA1Vault creado!",
  "settings.joinVault.emptyError": "Ingres\xE1 un Vault ID.",
  "settings.joinVault.error": "No se pudo unir al vault. Verific\xE1 el ID.",
  "settings.setupWizard": "Asistente de setup",
  "settings.setupWizard.desc": "Gu\xEDa paso a paso para conectar este vault a Supabase.",
  "settings.setupWizard.btn": "Abrir asistente",
  "settings.syncNow": "Sincronizar ahora",
  "settings.syncNow.desc": "Forzar una sincronizaci\xF3n completa con el servidor.",
  "settings.syncNow.btn": "Sincronizar ahora",
  "dashboard.title": "SupSync",
  "dashboard.vault": "Vault: {name}",
  "dashboard.syncNow": "Sincronizar",
  "dashboard.fullSync": "Sync completo",
  "conflict.title": "Conflicto de sincronizaci\xF3n",
  "exclusionPicker.title": "Seleccion\xE1 archivos y carpetas a excluir",
  "exclusionPicker.description": "Marc\xE1 los archivos y carpetas que quer\xE9s excluir del sync.",
  "exclusionPicker.cancel": "Cancelar",
  "exclusionPicker.confirm": "Agregar seleccionados",
  "conflict.description": "{path} fue modificado tanto local como remotamente.",
  "conflict.keepLocal": "Mantener versi\xF3n local",
  "conflict.keepRemote": "Mantener versi\xF3n remota",
  "conflict.skip": "Omitir por ahora",
  "conflict.labelLocal": "Local",
  "conflict.labelRemote": "Remoto",
  "conflict.empty": "(vac\xEDo)",
  "conflict.moreLines": "... y {count} l\xEDneas m\xE1s",
  "login.title.signIn": "Iniciar sesi\xF3n en SupSync",
  "login.title.register": "Crear cuenta",
  "login.email": "Email",
  "login.email.placeholder": "vos@ejemplo.com",
  "login.password": "Contrase\xF1a",
  "login.password.placeholder": "Tu contrase\xF1a",
  "login.btn.signIn": "Iniciar sesi\xF3n",
  "login.btn.register": "Registrarse",
  "login.btn.toggleIn": "Crear cuenta",
  "login.btn.toggleOut": "Ya tengo cuenta",
  "login.btn.cancel": "Cancelar",
  "login.error.fillFields": "Complet\xE1 los dos campos.",
  "login.waiting": "Esper\xE1...",
  "login.success.created": "Cuenta creada! Revis\xE1 tu email para confirmar, despu\xE9s inici\xE1 sesi\xF3n.",
  "login.success.signedIn": "Sesi\xF3n iniciada!",
  "login.error.failed": "Error de autenticaci\xF3n",
  "join.title": "Unirse a un vault compartido",
  "join.description": "Pedile el Vault ID al admin del vault. Lo pod\xE9s encontrar en el archivo .supsync-config.json del vault.",
  "join.label": "Vault ID",
  "join.placeholder": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "join.btn.join": "Unirse al vault",
  "join.btn.cancel": "Cancelar",
  "join.error.emptyId": "Ingres\xE1 un Vault ID.",
  "join.joining": "Uni\xE9ndose al vault...",
  "join.error.notFound": "Vault no encontrado. Verific\xE1 el ID e intent\xE1 de nuevo.",
  "join.success": "Te uniste a '{vault}'!",
  "onboard.progress": "Paso {current} de {total}",
  "onboard.btn.back": "Atr\xE1s",
  "onboard.btn.next": "Siguiente",
  "onboard.btn.done": "Listo",
  "onboard.step1.title": "Bienvenido a SupSync",
  "onboard.step1.p1": "SupSync te permite compartir un vault de Obsidian con tu equipo usando Supabase para sync en tiempo real y locking.",
  "onboard.step1.p2": "Este asistente te gu\xEDa para configurar Supabase y conectar tu vault.",
  "onboard.step1.p3": "Tiempo estimado: 10 minutos.",
  "onboard.step2.title": "Paso 1: Crear un proyecto Supabase",
  "onboard.step2.p1": "And\xE1 a https://supabase.com y registrate (o inici\xE1 sesi\xF3n).",
  "onboard.step2.p2": 'Hac\xE9 clic en "New project" y complet\xE1:',
  "onboard.step2.li1": "Nombre: el que quieras (ej: mi-vault-equipo)",
  "onboard.step2.li2": "Contrase\xF1a de la base de datos: eleg\xED una fuerte y guardala",
  "onboard.step2.li3": "Regi\xF3n: eleg\xED una cerca de tu equipo",
  "onboard.step2.li4": "Plan: Free funciona para hasta 500 MB de base de datos y 1 GB de storage",
  "onboard.step2.p3": "Hac\xE9 clic en Create project y esper\xE1 ~2 minutos.",
  "onboard.step3.title": "Paso 2: Ejecutar el setup SQL",
  "onboard.step3.p1": "En tu dashboard de Supabase (https://supabase.com/dashboard), seleccion\xE1 tu proyecto.",
  "onboard.step3.p2": "Abr\xED el SQL Editor (barra lateral izquierda \u2192 SQL Editor).",
  "onboard.step3.p3": "El script SQL est\xE1 debajo. Hac\xE9 clic en 'Copiar SQL' y pegalo en el SQL Editor.",
  "onboard.step3.copySql": "Copiar SQL",
  "onboard.step3.sqlCopied": "\xA1SQL copiado!",
  "onboard.step3.p5": 'Hac\xE9 clic en "Run" (o Ctrl+Enter). Deber\xEDas ver "Success. No rows returned."',
  "onboard.step3.p6": "Esto crea todas las tablas, \xEDndices, pol\xEDticas RLS y triggers necesarios para el sync.",
  "onboard.step4.title": "Paso 3: Crear el bucket de Storage",
  "onboard.step4.p1": "And\xE1 a Storage en la barra lateral izquierda de tu dashboard de Supabase.",
  "onboard.step4.p2": 'Hac\xE9 clic en "New bucket" y nombralo: vault-files',
  "onboard.step4.p3": "Marc\xE1: Public bucket (los archivos necesitan ser accesibles para descarga por los miembros).",
  "onboard.step4.p4": "En las Pol\xEDticas del bucket, agreg\xE1 estas pol\xEDticas:",
  "onboard.step4.li1": "SELECT: Permitir a usuarios autenticados leer (bucket_id = 'vault-files')",
  "onboard.step4.li2": "INSERT: Permitir a usuarios autenticados subir (bucket_id = 'vault-files')",
  "onboard.step4.li3": "DELETE: Permitir a usuarios autenticados borrar (bucket_id = 'vault-files')",
  "onboard.step5.title": "Paso 4: Conectar el plugin",
  "onboard.step5.p1": "And\xE1 al dashboard de tu proyecto Supabase \u2192 Settings \u2192 API.",
  "onboard.step5.p2": "Copi\xE1 la Project URL (https://tu-proyecto.supabase.co).",
  "onboard.step5.p3": "Copi\xE1 la clave an\xF3nima/p\xFAblica (NO la clave secreta service_role).",
  "onboard.step5.p4": "Peg\xE1 ambas en la configuraci\xF3n del plugin (Settings \u2192 Community Plugins \u2192 SupSync).",
  "onboard.step5.p5": "Ejecut\xE1 el comando 'SupSync: Setup vault' desde la paleta de comandos.",
  "onboard.step6.title": "Paso 5: Crear o unirse a un vault",
  "onboard.step6.p1": "Si es la PRIMERA vez que configur\xE1s este vault:",
  "onboard.step6.p2": "Us\xE1 el comando 'SupSync: Create shared vault' para registrar este vault en Supabase como admin.",
  "onboard.step6.p3": "Si te est\xE1s UNIENDO a un vault existente:",
  "onboard.step6.p4": "Us\xE1 el comando 'SupSync: Join vault' e ingres\xE1 el vault ID que te comparti\xF3 tu admin.",
  "onboard.step6.p5": "Compart\xED la carpeta del vault con tu equipo (v\xEDa syncthing, Google Drive, git, o cualquier herramienta de sync).",
  "onboard.step7.title": "Paso 6: Sincronizar por primera vez",
  "onboard.step7.p1": "Inici\xE1 sesi\xF3n con el comando 'SupSync: Sign in' (cre\xE1 una cuenta si necesit\xE1s).",
  "onboard.step7.p2": "Ejecut\xE1 'SupSync: Sync now' para bajar todas las notas existentes del vault.",
  "onboard.step7.p3": "Listo! Ya est\xE1s sincronizando.",
  "onboard.step7.p4": "Qu\xE9 se sincroniza:",
  "onboard.step7.li1": ".md \u2014 notas",
  "onboard.step7.li2": ".canvas \u2014 lienzos",
  "onboard.step7.li3": ".excalidraw \u2014 dibujos Excalidraw",
  "onboard.step7.li4": ".png, .jpg, .webp, .gif, .svg \u2014 im\xE1genes",
  "onboard.step7.li5": ".pdf \u2014 documentos PDF",
  "onboard.step7.li6": ".mp3, .wav, .ogg, .m4a \u2014 archivos de audio",
  "onboard.step8.title": "C\xF3mo funciona el locking",
  "onboard.step8.p1": "Cuando empez\xE1s a editar una nota, SupSync adquiere un lock para que nadie m\xE1s la edite al mismo tiempo.",
  "onboard.step8.p2": "Si alguien m\xE1s intenta editarla, ve un aviso: 'X est\xE1 editando esta nota'.",
  "onboard.step8.p3": "El lock se libera autom\xE1ticamente cuando:",
  "onboard.step8.li1": "Cerr\xE1s la nota",
  "onboard.step8.li2": "Dej\xE1s de escribir por 2 minutos",
  "onboard.step8.li3": "Cambi\xE1s a otra nota",
  "onboard.step8.p4": "Para solo lectura, no se necesita lock. Cualquiera puede leer cualquier nota en cualquier momento.",
  "whatsNew.title": "Novedades de SupSync",
  "whatsNew.subtitle": "Versi\xF3n {version}",
  "whatsNew.close": "Entendido",
  "whatsNew.type.feature": "Nuevo",
  "whatsNew.type.fix": "Fix",
  "whatsNew.type.improvement": "Mejora"
};

// src/i18n/index.ts
var locales = { en: en_default, es: es_default };
var fallback = en_default;
var currentLocale = en_default;
function initLocale() {
  const lang = (0, import_obsidian.getLanguage)();
  currentLocale = locales[lang] || fallback;
}
function t(key, params) {
  let text = currentLocale[key] || fallback[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

// src/exclusion-picker-modal.ts
var import_obsidian2 = require("obsidian");
var ExclusionPickerModal = class extends import_obsidian2.Modal {
  constructor(app3, existingExclusions, onConfirm) {
    super(app3);
    this.selectedPaths = /* @__PURE__ */ new Set();
    this.existingExclusions = existingExclusions;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-exclusion-picker");
    contentEl.createDiv({ text: t("exclusionPicker.title"), cls: "supsync-modal-title" });
    contentEl.createEl("p", {
      text: t("exclusionPicker.description"),
      cls: "supsync-exclusion-picker-desc"
    });
    const treeContainer = contentEl.createDiv("supsync-exclusion-tree");
    const root = this.app.vault.getRoot();
    this.renderFolder(root, treeContainer, 0);
    new import_obsidian2.Setting(contentEl).addButton(
      (btn) => btn.setButtonText(t("exclusionPicker.cancel")).onClick(() => {
        this.close();
      })
    ).addButton(
      (btn) => btn.setButtonText(t("exclusionPicker.confirm")).setCta().onClick(() => {
        this.onConfirm([...this.selectedPaths]);
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
  renderFolder(folder, container, depth) {
    const children = folder.children ? [...folder.children].sort((a, b) => {
      const aIsFolder = a instanceof import_obsidian2.TFolder;
      const bIsFolder = b instanceof import_obsidian2.TFolder;
      if (aIsFolder !== bIsFolder)
        return aIsFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    }) : [];
    for (const child of children) {
      if (child instanceof import_obsidian2.TFolder) {
        if (child.name.startsWith("."))
          continue;
        this.renderFolderItem(child, container, depth);
      } else if (child instanceof import_obsidian2.TFile) {
        if (child.name.startsWith("."))
          continue;
        this.renderFileItem(child, container, depth);
      }
    }
  }
  renderFolderItem(folder, container, depth) {
    const item = container.createDiv("supsync-exclusion-item");
    item.setCssProps({ "--depth": String(depth) });
    const header = item.createDiv("supsync-exclusion-item-header");
    const toggle = header.createSpan("supsync-exclusion-toggle");
    toggle.textContent = "\u25B6";
    const checkbox = header.createEl("input", { type: "checkbox" });
    const folderPath = folder.path + "/";
    checkbox.checked = this.existingExclusions.includes(folderPath) || this.selectedPaths.has(folderPath);
    const icon = header.createSpan("supsync-exclusion-icon");
    icon.textContent = "\u{1F4C1}";
    const label = header.createSpan("supsync-exclusion-label");
    label.textContent = folder.name + "/";
    const childContainer = container.createDiv("supsync-exclusion-children");
    childContainer.addClass("supsync-exclusion-hidden");
    let expanded = false;
    let loaded = false;
    toggle.addEventListener("click", () => {
      expanded = !expanded;
      toggle.textContent = expanded ? "\u25BC" : "\u25B6";
      childContainer.toggleClass("supsync-exclusion-hidden", !expanded);
      if (!loaded) {
        this.renderFolder(folder, childContainer, depth + 1);
        loaded = true;
      }
    });
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        this.selectedPaths.add(folderPath);
      } else {
        this.selectedPaths.delete(folderPath);
      }
    });
  }
  renderFileItem(file, container, depth) {
    const ext = "." + file.extension;
    if (!SYNCABLE_ALL_EXTENSIONS.includes(ext))
      return;
    const item = container.createDiv("supsync-exclusion-item");
    item.setCssProps({ "--depth": String(depth) });
    const header = item.createDiv("supsync-exclusion-item-header");
    const spacer = header.createSpan("supsync-exclusion-toggle");
    spacer.textContent = " ";
    const checkbox = header.createEl("input", { type: "checkbox" });
    checkbox.checked = this.existingExclusions.includes(file.path) || this.selectedPaths.has(file.path);
    const icon = header.createSpan("supsync-exclusion-icon");
    icon.textContent = "\u{1F4C4}";
    const label = header.createSpan("supsync-exclusion-label");
    label.textContent = file.name;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        this.selectedPaths.add(file.path);
      } else {
        this.selectedPaths.delete(file.path);
      }
    });
  }
};

// src/supabase-client.ts
var import_obsidian3 = require("obsidian");
var settings;
var accessToken = "";
var refreshToken = "";
var currentUserId = "";
var persistTokens = null;
function setSupabaseSettings(s) {
  settings = s;
}
function setAccessToken(token) {
  accessToken = token;
}
function getAccessToken() {
  return accessToken;
}
function setRefreshToken(token) {
  refreshToken = token;
}
function getRefreshToken() {
  return refreshToken;
}
function setCurrentUserId(id) {
  currentUserId = id;
}
function getCurrentUserId() {
  return currentUserId;
}
function setPersistCallback(cb) {
  persistTokens = cb;
}
function baseUrl() {
  if (!settings)
    throw new Error("Supabase settings not initialized");
  return `${settings.supabaseUrl}/rest/v1`;
}
function storageBaseUrl() {
  if (!settings)
    throw new Error("Supabase settings not initialized");
  return `${settings.supabaseUrl}/storage/v1`;
}
function authHeaders() {
  const headers = {
    "Content-Type": "application/json",
    apikey: settings.supabaseAnonKey
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}
async function autoRefreshOn401(res) {
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (!refreshed)
      throw new Error("Session expired. Please sign in again.");
  }
}
async function supabaseGet(path, query) {
  const params = new URLSearchParams(query || {});
  const url = `${baseUrl()}/${path}?${params.toString()}`;
  let req = { url, method: "GET", headers: authHeaders() };
  let res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status === 401) {
    await autoRefreshOn401(res);
    req = { url, method: "GET", headers: authHeaders() };
    res = await (0, import_obsidian3.requestUrl)(req);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Supabase GET ${path}: ${res.status}`);
  }
  return res.json;
}
async function supabasePost(path, body, query) {
  const params = new URLSearchParams(query || {});
  const url = `${baseUrl()}/${path}?${params.toString()}`;
  const prefer = params.has("on_conflict") ? "resolution=merge-duplicates, return=representation" : "return=representation";
  let req = {
    url,
    method: "POST",
    headers: { ...authHeaders(), Prefer: prefer },
    body: JSON.stringify(body)
  };
  let res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status === 401) {
    await autoRefreshOn401(res);
    req = {
      url,
      method: "POST",
      headers: { ...authHeaders(), Prefer: prefer },
      body: JSON.stringify(body)
    };
    res = await (0, import_obsidian3.requestUrl)(req);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Supabase POST ${path}: ${res.status} ${res.text}`);
  }
  if (res.json && Array.isArray(res.json) && res.json.length > 0) {
    return res.json[0];
  }
  return null;
}
async function supabasePatch(path, body, query) {
  const params = new URLSearchParams(query || {});
  const url = `${baseUrl()}/${path}?${params.toString()}`;
  let req = {
    url,
    method: "PATCH",
    headers: { ...authHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(body)
  };
  let res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status === 401) {
    await autoRefreshOn401(res);
    req = {
      url,
      method: "PATCH",
      headers: { ...authHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(body)
    };
    res = await (0, import_obsidian3.requestUrl)(req);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Supabase PATCH ${path}: ${res.status}`);
  }
}
async function supabaseDelete(path, query) {
  const params = new URLSearchParams(query || {});
  const url = `${baseUrl()}/${path}?${params.toString()}`;
  let req = { url, method: "DELETE", headers: authHeaders() };
  let res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status === 401) {
    await autoRefreshOn401(res);
    req = { url, method: "DELETE", headers: authHeaders() };
    res = await (0, import_obsidian3.requestUrl)(req);
  }
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Supabase DELETE ${path}: ${res.status}`);
  }
}
function retryWithBackoff(fn, retries = 3) {
  return fn().catch((err) => {
    if (retries <= 0)
      throw err;
    const delay = Math.pow(2, 3 - retries) * 1e3;
    return new Promise(
      (resolve) => window.setTimeout(
        () => resolve(retryWithBackoff(fn, retries - 1)),
        delay
      )
    );
  });
}
function saveTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (persistTokens)
    persistTokens(access, refresh);
}
async function signUp(email, password) {
  const url = `${settings.supabaseUrl}/auth/v1/signup`;
  const req = {
    url,
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
    body: JSON.stringify({ email, password })
  };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    const err = res.json;
    throw new Error((err == null ? void 0 : err.msg) || `SignUp failed: ${res.status}`);
  }
  const data = res.json;
  if (data.session) {
    saveTokens(data.session.access_token, data.session.refresh_token);
  }
  return data;
}
async function signIn(email, password) {
  const url = `${settings.supabaseUrl}/auth/v1/token?grant_type=password`;
  const req = {
    url,
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
    body: JSON.stringify({ email, password })
  };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    const err = res.json;
    throw new Error((err == null ? void 0 : err.error_description) || `SignIn failed: ${res.status}`);
  }
  const data = res.json;
  saveTokens(data.access_token, data.refresh_token);
  return data;
}
async function refreshAccessToken() {
  if (!refreshToken || !settings)
    return false;
  const url = `${settings.supabaseUrl}/auth/v1/token?grant_type=refresh_token`;
  try {
    const req = {
      url,
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
      body: JSON.stringify({ refresh_token: refreshToken })
    };
    const res = await (0, import_obsidian3.requestUrl)(req);
    if (res.status < 200 || res.status >= 300) {
      clearStoredTokens();
      return false;
    }
    const data = res.json;
    saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch (e) {
    clearStoredTokens();
    return false;
  }
}
function clearStoredTokens() {
  accessToken = "";
  refreshToken = "";
  if (persistTokens)
    persistTokens("", "");
}
async function signOut() {
  const url = `${settings.supabaseUrl}/auth/v1/logout`;
  const req = {
    url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: settings.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    }
  };
  await (0, import_obsidian3.requestUrl)(req);
  saveTokens("", "");
}
async function getCurrentUser() {
  if (!accessToken)
    return null;
  const url = `${settings.supabaseUrl}/auth/v1/user`;
  const req = {
    url,
    method: "GET",
    headers: {
      apikey: settings.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    }
  };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    return null;
  }
  return res.json;
}
async function uploadToStorage(bucketName, storagePath, data, contentType) {
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
  const req = {
    url,
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": contentType
    },
    body: data
  };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Storage upload failed: ${res.status}`);
  }
  return res.json;
}
async function downloadFromStorage(bucketName, storagePath) {
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
  const req = { url, method: "GET", headers: authHeaders() };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Storage download failed: ${res.status}`);
  }
  return res.arrayBuffer;
}
async function deleteFromStorage(bucketName, storagePath) {
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
  const req = { url, method: "DELETE", headers: authHeaders() };
  const res = await (0, import_obsidian3.requestUrl)(req);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Storage delete failed: ${res.status}`);
  }
}

// src/settings.ts
var SupSyncSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app3, plugin) {
    super(app3, plugin);
    this.userEmail = "";
    this.plugin = plugin;
  }
  display() {
    void this.render().catch((err) => {
      console.error("[SupSync] Settings render failed:", err);
    });
  }
  async render() {
    const { containerEl } = this;
    containerEl.empty();
    await this.checkAuth();
    this.renderAuthSection(containerEl);
    new import_obsidian4.Setting(containerEl).setName(t("settings.heading.supabase")).setHeading();
    new import_obsidian4.Setting(containerEl).setName(t("settings.url")).setDesc(t("settings.url.desc")).addText(
      (text) => text.setPlaceholder(t("settings.url.placeholder")).setValue(this.plugin.settings.supabaseUrl).onChange(async (value) => {
        this.plugin.settings.supabaseUrl = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.anonKey")).setDesc(t("settings.anonKey.desc")).addText((text) => {
      text.setPlaceholder(t("settings.anonKey.placeholder")).setValue(this.plugin.settings.supabaseAnonKey);
      text.inputEl.type = "password";
      text.onChange(async (value) => {
        this.plugin.settings.supabaseAnonKey = value.trim();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian4.Setting(containerEl).setName(t("settings.heading.sync")).setHeading();
    new import_obsidian4.Setting(containerEl).setName(t("settings.syncInterval")).setDesc(t("settings.syncInterval.desc")).addText(
      (text) => text.setPlaceholder(t("settings.syncInterval.placeholder")).setValue(String(this.plugin.settings.syncInterval)).onChange(async (value) => {
        const n = parseInt(value, 10);
        this.plugin.settings.syncInterval = isNaN(n) ? 0 : Math.max(0, n);
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.conflictMode")).setDesc(t("settings.conflictMode.desc")).addDropdown(
      (dropdown) => dropdown.addOption("local-wins", t("settings.conflictMode.local")).addOption("remote-wins", t("settings.conflictMode.remote")).addOption("latest-wins", t("settings.conflictMode.latest")).addOption("ask", t("settings.conflictMode.ask")).setValue(this.plugin.settings.conflictMode).onChange(async (value) => {
        this.plugin.settings.conflictMode = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.storageLimit")).setDesc(t("settings.storageLimit.desc")).addText(
      (text) => text.setPlaceholder(t("settings.storageLimit.placeholder")).setValue(String(this.plugin.settings.storageLimitMB)).onChange(async (value) => {
        const n = parseInt(value, 10);
        this.plugin.settings.storageLimitMB = isNaN(n) ? 1024 : Math.max(1, n);
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.maxFileSize")).setDesc(t("settings.maxFileSize.desc")).addText(
      (text) => text.setPlaceholder(t("settings.maxFileSize.placeholder")).setValue(String(this.plugin.settings.maxFileSizeMB)).onChange(async (value) => {
        const n = parseInt(value, 10);
        this.plugin.settings.maxFileSizeMB = isNaN(n) ? 50 : Math.max(0, n);
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.autoSync")).setDesc(t("settings.autoSync.desc")).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoSyncEnabled).onChange(async (value) => {
        this.plugin.settings.autoSyncEnabled = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.heading.excluded")).setHeading();
    this.renderExclusionsSection(containerEl);
    new import_obsidian4.Setting(containerEl).setName(t("settings.heading.vault")).setHeading();
    new import_obsidian4.Setting(containerEl).setName(t("settings.setupWizard")).setDesc(t("settings.setupWizard.desc")).addButton(
      (btn) => btn.setButtonText(t("settings.setupWizard.btn")).onClick(() => {
        this.plugin.openOnboarding();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("settings.syncNow")).setDesc(t("settings.syncNow.desc")).addButton(
      (btn) => btn.setButtonText(t("settings.syncNow.btn")).onClick(() => {
        void (async () => {
          await this.plugin.syncManager.fullSync();
        })();
      })
    );
    const linkSection = containerEl.createDiv("supsync-more-work");
    linkSection.createEl("a", {
      text: "Si quieres conocer m\xE1s de nuestro trabajo y de otros plugins ingresa a spob.fly.dev",
      href: "https://spob.fly.dev"
    });
  }
  async checkAuth() {
    try {
      if (getAccessToken()) {
        const user = await getCurrentUser();
        this.userEmail = (user == null ? void 0 : user.email) || "";
      } else {
        this.userEmail = "";
      }
    } catch (e) {
      this.userEmail = "";
    }
  }
  renderAuthSection(containerEl) {
    new import_obsidian4.Setting(containerEl).setName(t("settings.heading.account")).setHeading();
    if (this.userEmail) {
      const info = new import_obsidian4.Setting(containerEl);
      info.setName(t("settings.auth.signedIn")).setDesc(this.userEmail);
      info.addButton(
        (btn) => btn.setButtonText(t("settings.auth.signOut")).onClick(() => {
          void (async () => {
            await signOut();
            this.plugin.currentUserId = "";
            setCurrentUserId("");
            new import_obsidian4.Notice(t("plugin.signedOut"));
            void this.render();
          })();
        })
      );
      if (this.plugin.vaultId) {
        new import_obsidian4.Setting(containerEl).setName(t("settings.heading.vault")).setHeading();
        const vaultInfo = new import_obsidian4.Setting(containerEl);
        vaultInfo.setName(this.plugin.vaultName || t("settings.vault.unnamed")).setDesc(t("settings.vault.id", { id: this.plugin.vaultId }));
        vaultInfo.addButton(
          (btn) => btn.setButtonText(t("settings.vault.copyId")).onClick(() => {
            void navigator.clipboard.writeText(this.plugin.vaultId);
            new import_obsidian4.Notice(t("settings.vault.copied"));
          })
        );
        return;
      }
      if (!this.plugin.vaultId) {
        new import_obsidian4.Setting(containerEl).setName(t("settings.heading.vaultSelect")).setHeading();
        const joinForm = containerEl.createDiv("supsync-login-settings");
        const vaultMsg = joinForm.createDiv("supsync-login-msg");
        const vaultRow = joinForm.createDiv("supsync-login-row");
        vaultRow.createEl("label", { text: t("settings.joinVault.label") });
        const vaultInput = vaultRow.createEl("input", {
          type: "text",
          placeholder: t("settings.joinVault.placeholder")
        });
        const joinBtnRow = joinForm.createDiv("supsync-login-btn-row");
        const joinBtn = joinBtnRow.createEl("button", { text: t("settings.joinVault.join") });
        joinBtn.addEventListener("click", () => {
          void (async () => {
            const vaultId3 = vaultInput.value.trim();
            if (!vaultId3) {
              vaultMsg.textContent = t("settings.joinVault.emptyError");
              vaultMsg.className = "supsync-login-msg supsync-msg-error";
              return;
            }
            vaultMsg.textContent = t("settings.joinVault.joining");
            vaultMsg.className = "supsync-login-msg supsync-msg-info";
            try {
              const sharedFn = this.plugin.joinVault.bind(this.plugin);
              await sharedFn(vaultId3);
              vaultMsg.textContent = t("settings.joinVault.success");
              vaultMsg.className = "supsync-login-msg supsync-msg-success";
              window.setTimeout(() => {
                void this.render();
              }, 800);
            } catch (err) {
              vaultMsg.textContent = err instanceof Error ? err.message : t("settings.joinVault.error");
              vaultMsg.className = "supsync-login-msg supsync-msg-error";
            }
          })();
        });
        const createBtn = joinBtnRow.createEl("button", {
          text: t("settings.joinVault.create"),
          cls: "supsync-toggle-btn"
        });
        createBtn.addEventListener("click", () => {
          void (async () => {
            vaultMsg.textContent = t("settings.joinVault.creating");
            vaultMsg.className = "supsync-login-msg supsync-msg-info";
            try {
              await this.plugin.createVault();
              vaultMsg.textContent = t("settings.joinVault.created");
              vaultMsg.className = "supsync-login-msg supsync-msg-success";
              window.setTimeout(() => {
                void this.render();
              }, 800);
            } catch (err) {
              vaultMsg.textContent = err instanceof Error ? err.message : t("settings.joinVault.error");
              vaultMsg.className = "supsync-login-msg supsync-msg-error";
            }
          })();
        });
      }
      return;
    }
    const formContainer = containerEl.createDiv("supsync-login-settings");
    const emailRow = formContainer.createDiv("supsync-login-row");
    emailRow.createEl("label", { text: t("login.email") });
    const emailInput = emailRow.createEl("input", {
      type: "email",
      placeholder: t("login.email.placeholder")
    });
    const passRow = formContainer.createDiv("supsync-login-row");
    passRow.createEl("label", { text: t("login.password") });
    const passInput = passRow.createEl("input", {
      type: "password",
      placeholder: t("login.password.placeholder")
    });
    const msgEl = formContainer.createDiv("supsync-login-msg");
    const btnRow = formContainer.createDiv("supsync-login-btn-row");
    const signInBtn = btnRow.createEl("button", { text: t("login.btn.signIn") });
    signInBtn.addEventListener("click", () => {
      void (async () => {
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
          msgEl.textContent = t("login.error.fillFields");
          msgEl.className = "supsync-login-msg supsync-msg-error";
          return;
        }
        msgEl.textContent = t("login.waiting");
        msgEl.className = "supsync-login-msg supsync-msg-info";
        try {
          const data = await signIn(email, password);
          this.plugin.currentUserId = data.user.id;
          setCurrentUserId(data.user.id);
          this.plugin.onAuthSuccess(data.user.email);
          msgEl.textContent = t("login.success.signedIn");
          msgEl.className = "supsync-login-msg supsync-msg-success";
          window.setTimeout(() => {
            void this.render();
          }, 800);
        } catch (err) {
          msgEl.textContent = err instanceof Error ? err.message : t("login.error.failed");
          msgEl.className = "supsync-login-msg supsync-msg-error";
        }
      })();
    });
    const registerBtn = btnRow.createEl("button", { text: t("login.btn.register") });
    registerBtn.className = "supsync-toggle-btn";
    registerBtn.addEventListener("click", () => {
      void (async () => {
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
          msgEl.textContent = t("login.error.fillFields");
          msgEl.className = "supsync-login-msg supsync-msg-error";
          return;
        }
        msgEl.textContent = t("login.waiting");
        msgEl.className = "supsync-login-msg supsync-msg-info";
        try {
          const data = await signUp(email, password);
          if (data == null ? void 0 : data.session) {
            this.plugin.currentUserId = data.user.id;
            setCurrentUserId(data.user.id);
            this.plugin.onAuthSuccess(data.user.email);
            msgEl.textContent = t("login.success.signedIn");
            msgEl.className = "supsync-login-msg supsync-msg-success";
            window.setTimeout(() => {
              void this.render();
            }, 800);
          } else {
            msgEl.textContent = t("login.success.signedIn");
            msgEl.className = "supsync-login-msg supsync-msg-success";
            window.setTimeout(() => {
              void this.render();
            }, 1500);
          }
        } catch (err) {
          msgEl.textContent = err instanceof Error ? err.message : t("login.error.failed");
          msgEl.className = "supsync-login-msg supsync-msg-error";
        }
      })();
    });
  }
  renderExclusionsSection(containerEl) {
    const desc = containerEl.createDiv();
    desc.createEl("p", {
      text: t("settings.excludedPaths.desc"),
      cls: "setting-item-description"
    });
    const tagsContainer = containerEl.createDiv("supsync-exclusion-tags");
    this.renderExclusionTags(tagsContainer);
    const browseSetting = new import_obsidian4.Setting(containerEl);
    browseSetting.addButton(
      (btn) => btn.setButtonText(t("settings.excludedPaths.browse")).setCta().onClick(() => {
        new ExclusionPickerModal(
          this.app,
          this.plugin.settings.excludedPaths,
          (selected) => {
            void (async () => {
              const merged = /* @__PURE__ */ new Set([
                ...this.plugin.settings.excludedPaths,
                ...selected
              ]);
              this.plugin.settings.excludedPaths = [...merged];
              await this.plugin.saveSettings();
              void this.render();
            })();
          }
        ).open();
      })
    );
    browseSetting.addButton(
      (btn) => btn.setButtonText(t("settings.excludedPaths.clearAll")).onClick(() => {
        void (async () => {
          this.plugin.settings.excludedPaths = [];
          await this.plugin.saveSettings();
          void this.render();
        })();
      })
    );
  }
  renderExclusionTags(container) {
    container.empty();
    const paths = this.plugin.settings.excludedPaths;
    if (paths.length === 0) {
      container.createEl("p", {
        text: t("settings.excludedPaths.empty"),
        cls: "supsync-exclusion-empty"
      });
      return;
    }
    for (const path of paths) {
      const tag = container.createSpan("supsync-exclusion-tag");
      tag.createSpan({ text: path });
      const removeBtn = tag.createSpan("supsync-exclusion-tag-remove");
      removeBtn.textContent = "\xD7";
      removeBtn.addEventListener("click", () => {
        void (async () => {
          this.plugin.settings.excludedPaths = this.plugin.settings.excludedPaths.filter((p) => p !== path);
          await this.plugin.saveSettings();
          this.renderExclusionTags(container);
        })();
      });
    }
  }
};

// src/login-modal.ts
var import_obsidian5 = require("obsidian");
var LoginModal = class extends import_obsidian5.Modal {
  constructor(app3, callback) {
    super(app3);
    this.mode = "login";
    this.closed = false;
    this.callback = callback;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-login-modal");
    new import_obsidian5.Setting(contentEl).setName(this.mode === "login" ? t("login.title.signIn") : t("login.title.register")).setHeading();
    this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });
    const form = contentEl.createDiv({ cls: "supsync-login-form" });
    form.createEl("label", { text: t("login.email") });
    this.emailEl = form.createEl("input", { type: "email", placeholder: t("login.email.placeholder") });
    form.createEl("label", { text: t("login.password") });
    this.passwordEl = form.createEl("input", { type: "password", placeholder: t("login.password.placeholder") });
    const btnRow = form.createDiv({ cls: "supsync-login-buttons" });
    const submitBtn = btnRow.createEl("button", {
      text: this.mode === "login" ? t("login.btn.signIn") : t("login.btn.register")
    });
    submitBtn.addEventListener("click", () => {
      void this.submit();
    });
    const toggleBtn = btnRow.createEl("button", {
      text: this.mode === "login" ? t("login.btn.toggleIn") : t("login.btn.toggleOut"),
      cls: "supsync-toggle-btn"
    });
    toggleBtn.addEventListener("click", () => {
      this.mode = this.mode === "login" ? "register" : "login";
      this.onOpen();
    });
    const cancelBtn = btnRow.createEl("button", {
      text: t("login.btn.cancel"),
      cls: "supsync-cancel-btn"
    });
    cancelBtn.addEventListener("click", () => this.close());
  }
  async submit() {
    const email = this.emailEl.value.trim();
    const password = this.passwordEl.value;
    if (!email || !password) {
      this.showMessage(t("login.error.fillFields"), "error");
      return;
    }
    this.showMessage(t("login.waiting"), "info");
    try {
      if (this.mode === "register") {
        await signUp(email, password);
        this.showMessage(t("login.success.created"), "success");
        this.mode = "login";
        window.setTimeout(() => {
          if (!this.closed)
            this.onOpen();
        }, 2e3);
        return;
      }
      await signIn(email, password);
      this.showMessage(t("login.success.signedIn"), "success");
      window.setTimeout(() => {
        this.callback(true);
        this.close();
      }, 800);
    } catch (err) {
      this.showMessage(
        err instanceof Error ? err.message : t("login.error.failed"),
        "error"
      );
    }
  }
  showMessage(text, type) {
    this.messageEl.empty();
    this.messageEl.createSpan({ text, cls: `supsync-msg-${type}` });
  }
  onClose() {
    this.closed = true;
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/onboard-modal.ts
var import_obsidian6 = require("obsidian");

// src/setup-sql.ts
var SETUP_SQL = `
-- SupSync: Supabase setup script
-- Run this in the Supabase SQL Editor after creating your project.

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tables

CREATE TABLE vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vault_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vault_id, user_id)
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(vault_id, path)
);

CREATE TABLE locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(vault_id, path)
);

CREATE TABLE vault_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    hash TEXT DEFAULT '',
    storage_path TEXT NOT NULL,
    content_type TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vault_id, path)
);

-- 3. Indexes

CREATE INDEX idx_notes_vault_path ON notes(vault_id, path);
CREATE INDEX idx_notes_updated ON notes(vault_id, updated_at);
CREATE INDEX idx_locks_vault_path ON locks(vault_id, path);
CREATE INDEX idx_locks_expires ON locks(expires_at);
CREATE INDEX idx_vault_files_vault ON vault_files(vault_id);
CREATE INDEX idx_vault_members_user ON vault_members(user_id);
CREATE INDEX idx_vault_members_vault ON vault_members(vault_id);

-- 4. Helper functions

-- Extract user UUID from JWT claims directly.
-- auth.uid() can return NULL when called from within a SECURITY DEFINER trigger,
-- so we read request.jwt.claims explicitly.
CREATE OR REPLACE FUNCTION supsync_uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT (
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb
        ->> 'sub'
    )::UUID;
$$;

-- Check vault membership without RLS recursion.
-- SECURITY DEFINER bypasses RLS so this can be used inside policy expressions
-- that would otherwise trigger infinite recursion on vault_members.
CREATE OR REPLACE FUNCTION is_vault_member(p_vault_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM vault_members
        WHERE vault_id = p_vault_id AND user_id = supsync_uid()
    );
END;
$$;

-- 5. RLS Policies

-- vaults
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaults_select" ON vaults
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "vaults_insert" ON vaults
    FOR INSERT WITH CHECK (true);

CREATE POLICY "vaults_update" ON vaults
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = id
            AND user_id = supsync_uid()
            AND role = 'admin'
        )
    );

-- vault_members
ALTER TABLE vault_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON vault_members
    FOR SELECT USING (is_vault_member(vault_id) OR user_id = auth.uid());

CREATE POLICY "members_insert_self" ON vault_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_delete_admin" ON vault_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_members.vault_id
            AND user_id = supsync_uid()
            AND role = 'admin'
        )
    );

-- notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "notes_insert_member" ON notes
    FOR INSERT WITH CHECK (is_vault_member(vault_id));

CREATE POLICY "notes_update_member" ON notes
    FOR UPDATE USING (is_vault_member(vault_id));

CREATE POLICY "notes_delete_member" ON notes
    FOR DELETE USING (is_vault_member(vault_id));

-- locks
ALTER TABLE locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locks_select" ON locks
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "locks_insert_no_conflict" ON locks
    FOR INSERT WITH CHECK (
        is_vault_member(vault_id)
        AND user_id = supsync_uid()
        AND NOT EXISTS (
            SELECT 1 FROM locks l
            WHERE l.vault_id = locks.vault_id
            AND l.path = locks.path
            AND l.expires_at > now()
        )
    );

CREATE POLICY "locks_update_owner" ON locks
    FOR UPDATE USING (user_id = supsync_uid());

CREATE POLICY "locks_delete_owner" ON locks
    FOR DELETE USING (user_id = supsync_uid());

-- vault_files
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select" ON vault_files
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "files_insert_member" ON vault_files
    FOR INSERT WITH CHECK (is_vault_member(vault_id));

CREATE POLICY "files_update_member" ON vault_files
    FOR UPDATE USING (is_vault_member(vault_id));

CREATE POLICY "files_delete_member" ON vault_files
    FOR DELETE USING (is_vault_member(vault_id));

-- 6. Trigger: vault creator becomes admin
CREATE OR REPLACE FUNCTION make_creator_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO vault_members (vault_id, user_id, role)
    VALUES (NEW.id, supsync_uid(), 'admin');
    RETURN NEW;
END;
$$;

CREATE TRIGGER vault_creator_is_admin
    AFTER INSERT ON vaults
    FOR EACH ROW EXECUTE FUNCTION make_creator_admin();

-- 7. Cleanup: expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM locks WHERE expires_at <= now();
END;
$$;

-- 8. Grant table privileges to API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON vaults TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_members TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON locks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_files TO anon, authenticated;
`;

// src/onboard-modal.ts
var OnboardModal = class extends import_obsidian6.Modal {
  constructor(app3) {
    super(app3);
    this.currentStep = 0;
    this.steps = this.buildSteps();
  }
  buildSteps() {
    return [
      {
        title: t("onboard.step1.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step1.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step1.p2") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step1.p3"),
            cls: "supsync-onboard-hint"
          });
        }
      },
      {
        title: t("onboard.step2.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step2.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step2.p2") });
          const ul = this.stepContainer.createEl("ul");
          ul.createEl("li", { text: t("onboard.step2.li1") });
          ul.createEl("li", { text: t("onboard.step2.li2") });
          ul.createEl("li", { text: t("onboard.step2.li3") });
          ul.createEl("li", { text: t("onboard.step2.li4") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step2.p3"),
            cls: "supsync-onboard-hint"
          });
        }
      },
      {
        title: t("onboard.step3.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step3.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step3.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step3.p3") });
          const sqlBlock = this.stepContainer.createEl("pre", {
            cls: "supsync-sql-block"
          });
          sqlBlock.createEl("code", { text: SETUP_SQL });
          const copyBtn = this.stepContainer.createEl("button", {
            text: t("onboard.step3.copySql"),
            cls: "supsync-copy-btn"
          });
          copyBtn.addEventListener("click", () => {
            void (async () => {
              try {
                await navigator.clipboard.writeText(SETUP_SQL);
                copyBtn.setText(t("onboard.step3.sqlCopied"));
                window.setTimeout(() => {
                  copyBtn.setText(t("onboard.step3.copySql"));
                }, 2e3);
              } catch (e) {
              }
            })();
          });
          this.stepContainer.createEl("p", { text: t("onboard.step3.p5") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step3.p6"),
            cls: "supsync-onboard-hint"
          });
        }
      },
      {
        title: t("onboard.step4.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step4.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step4.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step4.p3") });
          this.stepContainer.createEl("p", { text: t("onboard.step4.p4") });
          const ul = this.stepContainer.createEl("ul");
          ul.createEl("li", { text: t("onboard.step4.li1") });
          ul.createEl("li", { text: t("onboard.step4.li2") });
          ul.createEl("li", { text: t("onboard.step4.li3") });
        }
      },
      {
        title: t("onboard.step5.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step5.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step5.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step5.p3") });
          this.stepContainer.createEl("p", { text: t("onboard.step5.p4") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step5.p5"),
            cls: "supsync-onboard-hint"
          });
        }
      },
      {
        title: t("onboard.step6.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step6.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step6.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step6.p3") });
          this.stepContainer.createEl("p", { text: t("onboard.step6.p4") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step6.p5"),
            cls: "supsync-onboard-hint"
          });
        }
      },
      {
        title: t("onboard.step7.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step7.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step7.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step7.p3") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step7.p4"),
            cls: "supsync-onboard-hint"
          });
          const ul = this.stepContainer.createEl("ul");
          ul.createEl("li", { text: t("onboard.step7.li1") });
          ul.createEl("li", { text: t("onboard.step7.li2") });
          ul.createEl("li", { text: t("onboard.step7.li3") });
          ul.createEl("li", { text: t("onboard.step7.li4") });
          ul.createEl("li", { text: t("onboard.step7.li5") });
          ul.createEl("li", { text: t("onboard.step7.li6") });
        }
      },
      {
        title: t("onboard.step8.title"),
        content: () => {
          this.stepContainer.createEl("p", { text: t("onboard.step8.p1") });
          this.stepContainer.createEl("p", { text: t("onboard.step8.p2") });
          this.stepContainer.createEl("p", { text: t("onboard.step8.p3") });
          const ul = this.stepContainer.createEl("ul");
          ul.createEl("li", { text: t("onboard.step8.li1") });
          ul.createEl("li", { text: t("onboard.step8.li2") });
          ul.createEl("li", { text: t("onboard.step8.li3") });
          this.stepContainer.createEl("p", {
            text: t("onboard.step8.p4"),
            cls: "supsync-onboard-hint"
          });
        }
      }
    ];
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-onboard-modal");
    this.renderStep();
  }
  renderStep() {
    const { contentEl } = this;
    contentEl.empty();
    const step = this.steps[this.currentStep];
    const header = contentEl.createDiv({ cls: "supsync-onboard-header" });
    header.createEl("span", {
      text: t("onboard.progress", {
        current: this.currentStep + 1,
        total: this.steps.length
      }),
      cls: "supsync-onboard-progress"
    });
    new import_obsidian6.Setting(header).setName(step.title).setHeading();
    this.stepContainer = contentEl.createDiv({ cls: "supsync-onboard-body" });
    step.content();
    const footer = contentEl.createDiv({ cls: "supsync-onboard-footer" });
    if (this.currentStep > 0) {
      const prevBtn = footer.createEl("button", { text: t("onboard.btn.back") });
      prevBtn.addEventListener("click", () => {
        this.currentStep--;
        this.renderStep();
      });
    }
    if (this.currentStep < this.steps.length - 1) {
      const nextBtn = footer.createEl("button", {
        text: t("onboard.btn.next"),
        cls: "mod-cta"
      });
      nextBtn.addEventListener("click", () => {
        this.currentStep++;
        this.renderStep();
      });
    } else {
      const doneBtn = footer.createEl("button", {
        text: t("onboard.btn.done"),
        cls: "mod-cta"
      });
      doneBtn.addEventListener("click", () => this.close());
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/join-vault-modal.ts
var import_obsidian7 = require("obsidian");

// src/supabase-api.ts
async function createVault(name) {
  const vaults = await retryWithBackoff(
    () => supabasePost("vaults", { name })
  );
  if (!vaults)
    throw new Error("Failed to create vault");
  return vaults;
}
async function getVault(vaultId3) {
  const vaults = await retryWithBackoff(
    () => supabaseGet("vaults", {
      id: `eq.${vaultId3}`
    })
  );
  return vaults.length > 0 ? vaults[0] : null;
}
async function joinVault(vaultId3) {
  try {
    await retryWithBackoff(
      () => supabasePost("vault_members", {
        vault_id: vaultId3,
        user_id: getCurrentUserId()
      })
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("409"))
      return;
    throw err;
  }
}
async function fetchNotes(vaultId3, since) {
  const query = {
    vault_id: `eq.${vaultId3}`,
    order: "updated_at.asc",
    select: "*"
  };
  if (since) {
    query.updated_at = `gt.${since}`;
  }
  return retryWithBackoff(() => supabaseGet("notes", query));
}
async function upsertNote(vaultId3, path, content) {
  const body = {
    vault_id: vaultId3,
    path,
    content,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    deleted: false
  };
  await retryWithBackoff(
    () => supabasePost("notes", body, {
      on_conflict: "vault_id,path"
    })
  );
}
async function softDeleteNote(vaultId3, path) {
  await retryWithBackoff(
    () => supabasePatch(
      "notes",
      { deleted: true, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { vault_id: `eq.${vaultId3}`, path: `eq.${path}` }
    )
  );
}
async function renameNote(vaultId3, oldPath, newPath) {
  await retryWithBackoff(
    () => supabasePatch(
      "notes",
      { path: newPath, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { vault_id: `eq.${vaultId3}`, path: `eq.${oldPath}` }
    )
  );
}
async function acquireLock(vaultId3, path, ttlMinutes = 2) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 6e4).toISOString();
  return retryWithBackoff(
    () => supabasePost("locks", {
      vault_id: vaultId3,
      path,
      expires_at: expiresAt
    })
  );
}
async function refreshLock(lockId, ttlMinutes = 2) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 6e4).toISOString();
  await retryWithBackoff(
    () => supabasePatch("locks", { expires_at: expiresAt }, { id: `eq.${lockId}` })
  );
}
async function releaseLock(lockId) {
  await retryWithBackoff(() => supabaseDelete("locks", { id: `eq.${lockId}` }));
}
async function getActiveLock(vaultId3, path) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const locks = await retryWithBackoff(
    () => supabaseGet("locks", {
      vault_id: `eq.${vaultId3}`,
      path: `eq.${path}`,
      expires_at: `gt.${now}`,
      limit: "1"
    })
  );
  return locks.length > 0 ? locks[0] : null;
}
async function upsertVaultFile(file) {
  await retryWithBackoff(
    () => supabasePost("vault_files", file, {
      on_conflict: "vault_id,path"
    })
  );
}
async function deleteVaultFileRecord(vaultId3, path) {
  await retryWithBackoff(
    () => supabaseDelete("vault_files", {
      vault_id: `eq.${vaultId3}`,
      path: `eq.${path}`
    })
  );
}
async function getStorageUsage(vaultId3) {
  const files = await retryWithBackoff(
    () => supabaseGet("vault_files", {
      vault_id: `eq.${vaultId3}`,
      select: "size"
    })
  );
  return files.reduce((sum, f) => sum + (f.size || 0), 0);
}
async function getVaultFiles(vaultId3) {
  return retryWithBackoff(
    () => supabaseGet("vault_files", {
      vault_id: `eq.${vaultId3}`,
      select: "*"
    })
  );
}

// src/join-vault-modal.ts
var JoinVaultModal = class extends import_obsidian7.Modal {
  constructor(app3, callback) {
    super(app3);
    this.closed = false;
    this.callback = callback;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-login-modal");
    new import_obsidian7.Setting(contentEl).setName(t("join.title")).setHeading();
    contentEl.createEl("p", {
      text: t("join.description"),
      cls: "supsync-msg-info"
    });
    this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });
    const form = contentEl.createDiv({ cls: "supsync-login-form" });
    form.createEl("label", { text: t("join.label") });
    this.vaultIdEl = form.createEl("input", {
      type: "text",
      placeholder: t("join.placeholder")
    });
    const btnRow = form.createDiv({ cls: "supsync-login-buttons" });
    const joinBtn = btnRow.createEl("button", { text: t("join.btn.join") });
    joinBtn.addEventListener("click", () => {
      void this.submit();
    });
    const cancelBtn = btnRow.createEl("button", {
      text: t("join.btn.cancel"),
      cls: "supsync-cancel-btn"
    });
    cancelBtn.addEventListener("click", () => this.close());
  }
  async submit() {
    const vaultId3 = this.vaultIdEl.value.trim();
    if (!vaultId3) {
      this.showMessage(t("join.error.emptyId"), "error");
      return;
    }
    this.showMessage(t("join.joining"), "info");
    try {
      const vault = await getVault(vaultId3);
      if (!vault) {
        this.showMessage(t("join.error.notFound"), "error");
        return;
      }
      await joinVault(vaultId3);
      this.showMessage(t("join.success", { vault: vault.name }), "success");
      window.setTimeout(() => {
        if (this.closed)
          return;
        void this.callback(vaultId3, vault.name);
        this.close();
      }, 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("join.error.notFound");
      this.showMessage(msg, "error");
    }
  }
  showMessage(text, type) {
    this.messageEl.empty();
    this.messageEl.createSpan({ text, cls: `supsync-msg-${type}` });
  }
  onClose() {
    this.closed = true;
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/whats-new-modal.ts
var import_obsidian8 = require("obsidian");

// src/changelog.ts
var CHANGELOG = [
  {
    version: "0.7.7",
    date: "2026-07-15",
    changes: [
      { type: "fix", text: "Auth tokens no longer get lost \u2014 expired refresh tokens are cleared from storage and session auto-recovers" },
      { type: "feature", text: "Auto-sync: remote changes are pulled automatically after each local push" },
      { type: "feature", text: "Periodic session health check (every 30 min) keeps tokens alive and auto-reconnects on expiry" },
      { type: "improvement", text: "New 'Auto-sync' toggle in settings (enabled by default)" }
    ]
  },
  {
    version: "0.7.4",
    date: "2026-06-14",
    changes: [
      { type: "fix", text: "Fixed session not persisting across Obsidian restarts \u2014 auto refresh expired tokens" }
    ]
  },
  {
    version: "0.7.3",
    date: "2026-06-14",
    changes: [
      { type: "improvement", text: "Updated spob URL to spob.fly.dev" },
      { type: "feature", text: "Added 'More about our work' link in settings" }
    ]
  },
  {
    version: "0.7.2",
    date: "2026-06-14",
    changes: [
      { type: "feature", text: "What's New modal \u2014 shows changelog on plugin update" },
      { type: "fix", text: "Updated SQL setup script with correct RLS policies for new installations" },
      { type: "fix", text: "Fixed typo in Spanish onboarding text" }
    ]
  },
  {
    version: "0.7.1",
    date: "2026-06-14",
    changes: [
      { type: "fix", text: "Fixed Obsidian review bot warning about regex control characters" },
      { type: "fix", text: "Updated SQL setup script with correct RLS policies" }
    ]
  },
  {
    version: "0.7.0",
    date: "2026-06-14",
    changes: [
      { type: "feature", text: "Configurable max file size limit (default 50MB)" },
      { type: "feature", text: "Binary file exclusion support in pull sync" },
      { type: "feature", text: "Full initial sync \u2014 scans and pushes all local files" },
      { type: "feature", text: "CI release workflow for automatic builds" },
      { type: "fix", text: "Fixed RLS policies for vault joining flow" },
      { type: "fix", text: "Fixed storage encoding for Unicode paths" },
      { type: "fix", text: "Fixed binary file parent folder creation" },
      { type: "fix", text: "Fixed upsert with proper Prefer header" }
    ]
  },
  {
    version: "0.6.2",
    date: "2026-06-13",
    changes: [
      { type: "feature", text: "Vault ID display with copy button in settings" },
      { type: "fix", text: "Fixed clipboard promise warning" }
    ]
  },
  {
    version: "0.6.0",
    date: "2026-06-13",
    changes: [
      { type: "feature", text: "Join/Create vault directly in settings tab" },
      { type: "fix", text: "Fixed joinVault sending literal 'auth.uid()' string" }
    ]
  },
  {
    version: "0.5.6",
    date: "2026-06-12",
    changes: [
      { type: "fix", text: "Removed lock requirement from notes RLS policies" },
      { type: "fix", text: "Fixed vault config loading on mobile" },
      { type: "fix", text: "Fixed blank settings on auth failure" }
    ]
  },
  {
    version: "0.5.0",
    date: "2026-06-12",
    changes: [
      { type: "feature", text: "Exclusion picker with vault tree view and glob support" },
      { type: "feature", text: "Auth token persistence and auto-refresh" },
      { type: "feature", text: "Login form in settings" }
    ]
  }
];

// src/whats-new-modal.ts
var WhatsNewModal = class extends import_obsidian8.Modal {
  constructor(app3, fromVersion) {
    super(app3);
    this.fromVersion = fromVersion;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-whats-new");
    const newEntries = this.getNewEntries();
    if (newEntries.length === 0) {
      this.close();
      return;
    }
    contentEl.createDiv({ text: t("whatsNew.title"), cls: "supsync-whats-new-title" });
    contentEl.createEl("p", {
      text: t("whatsNew.subtitle", { version: CHANGELOG[0].version }),
      cls: "supsync-whats-new-subtitle"
    });
    for (const entry of newEntries) {
      const section = contentEl.createDiv("supsync-whats-new-version");
      const header = section.createDiv("supsync-whats-new-header");
      header.createEl("span", { text: `v${entry.version}`, cls: "supsync-whats-new-version-tag" });
      header.createEl("span", { text: entry.date, cls: "supsync-whats-new-date" });
      const list = section.createEl("ul");
      for (const change of entry.changes) {
        const li = list.createEl("li");
        const badge = li.createSpan({
          cls: `supsync-whats-new-badge supsync-badge-${change.type}`
        });
        badge.textContent = t(`whatsNew.type.${change.type}`);
        li.createSpan({ text: ` ${change.text}` });
      }
    }
    new import_obsidian8.Setting(contentEl).addButton(
      (btn) => btn.setButtonText(t("whatsNew.close")).setCta().onClick(() => this.close())
    );
  }
  getNewEntries() {
    if (!this.fromVersion) {
      return CHANGELOG.slice(0, 3);
    }
    const idx = CHANGELOG.findIndex((e) => e.version === this.fromVersion);
    if (idx === -1) {
      return CHANGELOG.slice(0, 3);
    }
    return CHANGELOG.slice(0, idx);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/lock-manager.ts
var import_obsidian9 = require("obsidian");
var LockManager = class {
  constructor(settings3, onLockChanged) {
    this.activeLocks = /* @__PURE__ */ new Map();
    this.settings = settings3;
    this.onLockChanged = onLockChanged;
  }
  lockKey(vaultId3, path) {
    return `${vaultId3}::${path}`;
  }
  isLockedLocally(vaultId3, path) {
    return this.activeLocks.has(this.lockKey(vaultId3, path));
  }
  async tryAcquire(vaultId3, path) {
    if (!getAccessToken())
      return false;
    const key = this.lockKey(vaultId3, path);
    if (this.activeLocks.has(key))
      return true;
    const existing = await getActiveLock(vaultId3, path);
    if (existing && existing.user_id !== getCurrentUserId()) {
      this.onLockChanged(path, existing.user_id);
      return false;
    }
    const lock = await acquireLock(vaultId3, path);
    if (!lock)
      return false;
    const state = {
      lockId: lock.id,
      vaultId: vaultId3,
      path,
      heartbeatTimer: null
    };
    state.heartbeatTimer = window.setInterval(() => {
      void this.heartbeat(state);
    }, LOCK_HEARTBEAT_MS);
    this.activeLocks.set(key, state);
    this.onLockChanged(path, null);
    return true;
  }
  async heartbeat(state) {
    try {
      await refreshLock(state.lockId);
    } catch (e) {
      this.release(state.vaultId, state.path);
      new import_obsidian9.Notice(t("plugin.lostLock", { path: state.path }));
    }
  }
  release(vaultId3, path) {
    const key = this.lockKey(vaultId3, path);
    const state = this.activeLocks.get(key);
    if (!state)
      return;
    if (state.heartbeatTimer !== null) {
      window.clearInterval(state.heartbeatTimer);
    }
    this.activeLocks.delete(key);
    this.onLockChanged(path, null);
    void (async () => {
      try {
        await releaseLock(state.lockId);
      } catch (e) {
      }
    })();
  }
  releaseAll() {
    const releases = [];
    for (const [, state] of this.activeLocks) {
      if (state.heartbeatTimer !== null) {
        window.clearInterval(state.heartbeatTimer);
      }
      const p = (async () => {
        try {
          await releaseLock(state.lockId);
        } catch (e) {
        }
      })();
      releases.push(p);
    }
    this.activeLocks.clear();
    return Promise.all(releases);
  }
  async refreshAll() {
    for (const [, state] of this.activeLocks) {
      try {
        await refreshLock(state.lockId);
      } catch (e) {
        this.release(state.vaultId, state.path);
      }
    }
  }
};

// src/realtime-manager.ts
var REALTIME_PATH = "/realtime/v1/websocket";
var PHX_CHANNEL = "realtime:public:locks";
var RealtimeManager = class {
  constructor(supabaseUrl, onLockChange) {
    this.ws = null;
    this.heartbeatTimer = null;
    this.refCounter = 0;
    this.vaultId = "";
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.supabaseUrl = supabaseUrl;
    this.onLockChange = onLockChange;
  }
  connect(vaultId3) {
    if (this.ws)
      this.disconnect();
    this.vaultId = vaultId3;
    this.reconnectAttempts = 0;
    const wsUrl = this.supabaseUrl.replace(/^http/, "ws") + REALTIME_PATH;
    const apikey = authHeaders()["apikey"] || "";
    const token = getAccessToken();
    const params = new URLSearchParams({
      apikey,
      vsn: "1.0.0"
    });
    if (token) {
      params.set("token", token);
    }
    const fullUrl = `${wsUrl}?${params.toString()}`;
    this.ws = new WebSocket(fullUrl);
    this.ws.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.sendJoin();
    });
    this.ws.addEventListener("message", (event) => {
      void this.handleMessage(event.data);
    });
    this.ws.addEventListener("close", () => {
      this.stopHeartbeat();
      if (!this.vaultId)
        return;
      this.reconnectAttempts++;
      if (this.reconnectAttempts > this.maxReconnectAttempts)
        return;
      const delay = Math.min(
        5e3 * Math.pow(2, this.reconnectAttempts - 1),
        6e4
      );
      window.setTimeout(() => {
        this.connect(this.vaultId);
      }, delay);
    });
    this.ws.addEventListener("error", () => {
    });
  }
  disconnect() {
    this.vaultId = "";
    this.reconnectAttempts = 0;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  sendJoin() {
    if (!this.ws)
      return;
    const ref = String(++this.refCounter);
    this.ws.send(JSON.stringify({
      topic: PHX_CHANNEL,
      event: "phx_join",
      payload: {
        config: {
          broadcast: { self: true },
          presence: { key: "" },
          postgres_changes: [
            {
              event: "INSERT",
              schema: "public",
              table: "locks",
              filter: `vault_id=eq.${this.vaultId}`
            },
            {
              event: "DELETE",
              schema: "public",
              table: "locks",
              filter: `vault_id=eq.${this.vaultId}`
            }
          ]
        }
      },
      ref
    }));
  }
  async handleMessage(raw) {
    try {
      const msg = JSON.parse(raw);
      const { event, ref } = msg;
      if (event === "phx_reply" && ref) {
        if (msg.payload.status === "ok") {
          this.startHeartbeat();
        }
        return;
      }
      if (event === "heartbeat") {
        this.sendHeartbeatReply();
        return;
      }
      if (event === "postgres_changes") {
        this.handlePostgresChange(msg.payload);
      }
    } catch (e) {
    }
  }
  handlePostgresChange(payload) {
    const type = payload.type;
    if (!type)
      return;
    if (type === "INSERT" && payload.record) {
      const rec = payload.record;
      this.onLockChange(
        rec.path,
        rec.user_id,
        "acquired"
      );
    } else if (type === "DELETE" && payload.old_record) {
      const rec = payload.old_record;
      this.onLockChange(
        rec.path,
        null,
        "released"
      );
    }
  }
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const ref = String(++this.refCounter);
        this.ws.send(JSON.stringify({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref
        }));
      }
    }, 3e4);
  }
  sendHeartbeatReply() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const ref = String(++this.refCounter);
      this.ws.send(JSON.stringify({
        topic: "phoenix",
        event: "heartbeat",
        payload: {},
        ref
      }));
    }
  }
  stopHeartbeat() {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
};

// src/sync-manager.ts
var import_obsidian14 = require("obsidian");

// src/glob-match.ts
var GLOBSTAR = "**";
function matchGlob(pattern, path) {
  const normalizedPattern = pattern.replace(/\\/g, "/");
  const normalizedPath = path.replace(/\\/g, "/");
  if (!normalizedPattern.includes("*") && !normalizedPattern.includes("?")) {
    return normalizedPath === normalizedPattern || normalizedPath.startsWith(normalizedPattern + "/") || normalizedPath.startsWith(normalizedPattern);
  }
  return segmentMatch(
    normalizedPattern.split("/"),
    normalizedPath.split("/")
  );
}
function segmentMatch(patternSegs, pathSegs) {
  let pi = 0;
  let si = 0;
  let starPi = -1;
  let starSi = -1;
  while (si < pathSegs.length) {
    if (pi < patternSegs.length && patternSegs[pi] === GLOBSTAR) {
      starPi = pi;
      starSi = si;
      pi++;
    } else if (pi < patternSegs.length && matchSegment(patternSegs[pi], pathSegs[si])) {
      pi++;
      si++;
    } else if (starPi >= 0) {
      pi = starPi + 1;
      starSi++;
      si = starSi;
    } else {
      return false;
    }
  }
  while (pi < patternSegs.length && patternSegs[pi] === GLOBSTAR) {
    pi++;
  }
  return pi === patternSegs.length;
}
function matchSegment(pattern, value) {
  if (pattern === "*")
    return true;
  let pi = 0;
  let vi = 0;
  let starPi = -1;
  let starVi = -1;
  while (vi < value.length) {
    if (pi < pattern.length && (pattern[pi] === "?" || pattern[pi] === value[vi])) {
      pi++;
      vi++;
    } else if (pi < pattern.length && pattern[pi] === "*") {
      starPi = pi;
      starVi = vi;
      pi++;
    } else if (starPi >= 0) {
      pi = starPi + 1;
      starVi++;
      vi = starVi;
    } else {
      return false;
    }
  }
  while (pi < pattern.length && pattern[pi] === "*") {
    pi++;
  }
  return pi === pattern.length;
}

// src/binary-sync.ts
var import_obsidian10 = require("obsidian");
var app;
var vaultId = "";
var maxFileSizeMB = 50;
var excludedPaths = [];
function initBinarySync(obsidianApp, vault, pluginSettings) {
  app = obsidianApp;
  vaultId = vault;
  if (pluginSettings == null ? void 0 : pluginSettings.maxFileSizeMB)
    maxFileSizeMB = pluginSettings.maxFileSizeMB;
  if (pluginSettings == null ? void 0 : pluginSettings.excludedPaths)
    excludedPaths = pluginSettings.excludedPaths;
}
function isExcluded(path) {
  const configDir = app.vault.configDir;
  if (path.startsWith(configDir + "/") || path === configDir)
    return true;
  return excludedPaths.some((p) => matchGlob(p, path));
}
function sanitizeStoragePath(path) {
  return path.replace(/[^\p{ASCII}]/gu, (ch) => {
    const code = ch.charCodeAt(0);
    return code.toString(16).padStart(4, "0");
  });
}
function isBinaryFile(path) {
  const lower = path.toLowerCase();
  return SYNCABLE_BINARY_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
function mimeFromExt(ext) {
  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4"
  };
  return map[ext] || "application/octet-stream";
}
async function pushBinaryFile(path, type, oldPath) {
  var _a;
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
  if (!(file instanceof import_obsidian10.TFile))
    return;
  const maxBytes = maxFileSizeMB * 1024 * 1024;
  if (file.stat.size > maxBytes) {
    console.info(`[SupSync] Skipping ${path} (${(file.stat.size / 1048576).toFixed(1)} MB > ${maxFileSizeMB} MB limit)`);
    return;
  }
  const data = await vault.readBinary(file);
  const storagePath = sanitizeStoragePath(`${vaultId}/${path}`);
  const ext = ((_a = path.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  const contentType = mimeFromExt(ext);
  await retryWithBackoff(
    () => uploadToStorage("vault-files", storagePath, data, contentType)
  );
  await upsertVaultFile({
    vault_id: vaultId,
    path,
    size: data.byteLength,
    hash: "",
    storage_path: storagePath,
    content_type: contentType,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
}
async function ensureParentFolders(path) {
  const parts = path.split("/");
  let current = "";
  for (let i = 0; i < parts.length - 1; i++) {
    current = current ? `${current}/${parts[i]}` : parts[i];
    const exists = app.vault.getAbstractFileByPath(current);
    if (!exists) {
      try {
        await app.vault.createFolder(current);
      } catch (e) {
        await app.vault.adapter.mkdir(current);
      }
    }
  }
}
async function pullBinaryFiles() {
  const vault = app.vault;
  const remoteFiles = await getVaultFiles(vaultId);
  const maxBytes = maxFileSizeMB * 1024 * 1024;
  for (const rf of remoteFiles) {
    try {
      if (isExcluded(rf.path))
        continue;
      if (rf.size > maxBytes) {
        console.info(`[SupSync] Skipping pull ${rf.path} (${(rf.size / 1048576).toFixed(1)} MB > ${maxFileSizeMB} MB limit)`);
        continue;
      }
      const localFile = vault.getAbstractFileByPath(rf.path);
      if (!localFile) {
        const data = await retryWithBackoff(
          () => downloadFromStorage("vault-files", rf.storage_path)
        );
        await ensureParentFolders(rf.path);
        await vault.createBinary(rf.path, data);
      } else if (localFile instanceof import_obsidian10.TFile) {
        const remoteTime = new Date(rf.updated_at).getTime();
        const localTime = localFile.stat.mtime;
        if (remoteTime > localTime) {
          const data = await retryWithBackoff(
            () => downloadFromStorage("vault-files", rf.storage_path)
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

// src/sync-pull.ts
var import_obsidian12 = require("obsidian");

// src/conflict-modal.ts
var import_obsidian11 = require("obsidian");
var ConflictModal = class extends import_obsidian11.Modal {
  constructor(app3, path, localContent, remoteContent) {
    super(app3);
    this.path = path;
    this.localContent = localContent;
    this.remoteContent = remoteContent;
  }
  prompt() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-conflict-modal");
    new import_obsidian11.Setting(contentEl).setName(t("conflict.title")).setHeading();
    contentEl.createEl("p", {
      text: t("conflict.description", { path: this.path })
    });
    this.renderDiff();
    const buttons = contentEl.createDiv({ cls: "supsync-conflict-buttons" });
    const localBtn = buttons.createEl("button", {
      text: t("conflict.keepLocal"),
      cls: "mod-cta"
    });
    localBtn.addEventListener("click", () => {
      this.resolve("local");
      this.close();
    });
    const remoteBtn = buttons.createEl("button", {
      text: t("conflict.keepRemote")
    });
    remoteBtn.addEventListener("click", () => {
      this.resolve("remote");
      this.close();
    });
    const cancelBtn = buttons.createEl("button", {
      text: t("conflict.skip"),
      cls: "supsync-cancel-btn"
    });
    cancelBtn.addEventListener("click", () => {
      this.resolve("local");
      this.close();
    });
  }
  renderDiff() {
    const { contentEl } = this;
    const diffContainer = contentEl.createDiv({ cls: "supsync-diff-container" });
    const localLabel = diffContainer.createDiv({ cls: "supsync-diff-label" });
    localLabel.createSpan({ text: t("conflict.labelLocal"), cls: "supsync-diff-local-header" });
    const remoteLabel = diffContainer.createDiv({ cls: "supsync-diff-label" });
    remoteLabel.createSpan({ text: t("conflict.labelRemote"), cls: "supsync-diff-remote-header" });
    const localLines = this.localContent.split("\n");
    const remoteLines = this.remoteContent.split("\n");
    const maxLen = Math.max(localLines.length, remoteLines.length);
    const maxShow = Math.min(maxLen, 40);
    const sideBySide = diffContainer.createDiv({ cls: "supsync-diff-side" });
    for (let i = 0; i < maxShow; i++) {
      const row = sideBySide.createDiv({ cls: "supsync-diff-row" });
      const localLine = i < localLines.length ? localLines[i] : "";
      const remoteLine = i < remoteLines.length ? remoteLines[i] : "";
      const isDiff = localLine !== remoteLine;
      row.createSpan({
        text: localLine || t("conflict.empty"),
        cls: isDiff ? "supsync-diff-changed" : "supsync-diff-same"
      });
      row.createSpan({
        text: remoteLine || t("conflict.empty"),
        cls: isDiff ? "supsync-diff-changed" : "supsync-diff-same"
      });
    }
    if (maxLen > maxShow) {
      diffContainer.createEl("p", {
        text: t("conflict.moreLines", { count: maxLen - maxShow }),
        cls: "supsync-diff-more"
      });
    }
  }
  onClose() {
    if (!this.resolve)
      return;
    this.resolve("local");
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/sync-pull.ts
async function pullChanges(deps) {
  const { app: app3, settings: settings3, vaultId: vaultId3, lastSyncAt: lastSyncAt2, isRemoteChange, onStatusChange: onStatusChange2, onProgress } = deps;
  if (!vaultId3)
    return;
  if (!getAccessToken()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed)
      return;
  }
  if (onStatusChange2)
    onStatusChange2("pulling");
  try {
    const notes = await fetchNotes(vaultId3, lastSyncAt2.value || void 0);
    const vault = app3.vault;
    const total = notes.length;
    for (let i = 0; i < total; i++) {
      const note = notes[i];
      if (isPathExcluded(note.path, settings3.excludedPaths, app3.vault.configDir))
        continue;
      if (onProgress)
        onProgress(i + 1, total);
      try {
        isRemoteChange.value = true;
        const existing = vault.getAbstractFileByPath(note.path);
        if (note.deleted) {
          if (existing instanceof import_obsidian12.TFile)
            await app3.fileManager.trashFile(existing);
          lastSyncAt2.value = maxTimestamp(lastSyncAt2.value, note.updated_at);
          isRemoteChange.value = false;
          continue;
        }
        if (existing instanceof import_obsidian12.TFile) {
          const localContent = await vault.read(existing);
          if (note.content === localContent) {
            lastSyncAt2.value = maxTimestamp(lastSyncAt2.value, note.updated_at);
            isRemoteChange.value = false;
            continue;
          }
          const action = resolveConflict(
            existing.stat.mtime,
            note.updated_at,
            settings3.conflictMode
          );
          if (action === "accept-remote") {
            await vault.modify(existing, note.content);
          } else if (action === "ask") {
            const modal = new ConflictModal(
              app3,
              note.path,
              localContent,
              note.content
            );
            const choice = await modal.prompt();
            if (choice === "remote") {
              await vault.modify(existing, note.content);
            }
          }
        } else {
          const parts = note.path.split("/");
          for (let j = 0; j < parts.length - 1; j++) {
            const folder = (0, import_obsidian12.normalizePath)(parts.slice(0, j + 1).join("/"));
            if (!vault.getAbstractFileByPath(folder)) {
              await vault.createFolder(folder);
            }
          }
          await vault.create(note.path, note.content);
        }
      } catch (err) {
        console.warn("[SupSync] Pull skip:", note.path, err);
      }
      lastSyncAt2.value = maxTimestamp(lastSyncAt2.value, note.updated_at);
      isRemoteChange.value = false;
    }
    await pullBinaryFiles();
    await checkStorageWarning(settings3, vaultId3);
  } catch (err) {
    console.error("[SupSync] Pull failed:", err);
    if (onStatusChange2)
      onStatusChange2("error");
  } finally {
    isRemoteChange.value = false;
    if (onStatusChange2)
      onStatusChange2("idle");
  }
}
async function fullSync(deps) {
  const { vaultId: vaultId3, lastSyncAt: lastSyncAt2 } = deps;
  if (!vaultId3) {
    new import_obsidian12.Notice(t("plugin.setupFirst"));
    return;
  }
  if (!getAccessToken()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      new import_obsidian12.Notice(t("plugin.pleaseSignIn"));
      return;
    }
  }
  lastSyncAt2.value = "";
  try {
    await pullChanges(deps);
    await deps.flushQueue();
    new import_obsidian12.Notice(t("plugin.syncComplete"));
  } catch (err) {
    console.error("[SupSync] Full sync failed:", err);
    new import_obsidian12.Notice(t("plugin.syncFailed"));
  }
}
async function checkStorageWarning(settings3, vaultId3) {
  try {
    const used = await getStorageUsage(vaultId3);
    const limitBytes = settings3.storageLimitMB * 1024 * 1024;
    const pct = used / limitBytes;
    if (pct > STORAGE_WARNING_THRESHOLD) {
      const usedMB = Math.round(used / (1024 * 1024));
      new import_obsidian12.Notice(
        t("plugin.storageWarning", {
          used: usedMB,
          limit: settings3.storageLimitMB,
          pct: Math.round(pct * 100)
        }),
        8e3
      );
    }
  } catch (e) {
  }
}
function isPathExcluded(path, excludedPaths2, configDir) {
  if (path.startsWith(configDir + "/") || path === configDir)
    return true;
  return excludedPaths2.some(
    (p) => matchGlob(p, path)
  );
}
function maxTimestamp(a, b) {
  return a > b ? a : b;
}
function resolveConflict(localMtime, remoteIsoTimestamp, mode) {
  if (mode === "remote-wins")
    return "accept-remote";
  if (mode === "local-wins")
    return "keep-local";
  if (mode === "latest-wins") {
    const remoteTime2 = new Date(remoteIsoTimestamp).getTime();
    return remoteTime2 >= localMtime ? "accept-remote" : "keep-local";
  }
  if (mode === "ask")
    return "ask";
  const remoteTime = new Date(remoteIsoTimestamp).getTime();
  return remoteTime > localMtime ? "accept-remote" : "keep-local";
}

// src/status-bar.ts
var import_obsidian13 = require("obsidian");
var statusBarItem = null;
var pendingCount = 0;
var syncState = "idle";
var errors = [];
var onSyncTap = null;
function registerStatusBar(item, tapCb) {
  statusBarItem = item;
  onSyncTap = tapCb;
  item.addClass("supsync-status-bar-item");
  item.setText("SupSync");
  item.setAttribute("aria-label", "SupSync: tap to sync");
  item.addEventListener("click", () => {
    if (errors.length > 0) {
      showErrorSummary();
    } else if (onSyncTap) {
      onSyncTap();
    }
  });
}
function setPendingCount(n) {
  pendingCount = n;
  render();
}
function setSyncState(state) {
  syncState = state;
  render();
}
function addSyncError(path, message) {
  errors.push({ path, message });
  if (errors.length > 20)
    errors.shift();
  render();
}
function clearSyncErrors() {
  errors = [];
  render();
}
function render() {
  if (!statusBarItem)
    return;
  const parts = [];
  if (syncState === "error") {
    parts.push("\u26A0");
  } else if (syncState === "pushing") {
    parts.push("\u2191");
  } else if (syncState === "pulling") {
    parts.push("\u2193");
  }
  if (pendingCount > 0) {
    parts.push(String(pendingCount));
  }
  if (errors.length > 0) {
    parts.push(`(${errors.length})`);
  }
  statusBarItem.setText(parts.join(" ") || "SupSync");
  statusBarItem.setAttribute("aria-label", getTooltip());
}
function getTooltip() {
  const lines = [];
  if (pendingCount > 0)
    lines.push(`${pendingCount} changes pending`);
  if (errors.length > 0)
    lines.push(`${errors.length} sync errors`);
  lines.push("Tap to sync");
  return lines.join(" \u2014 ");
}
function showErrorSummary() {
  const count = errors.length;
  if (count === 0)
    return;
  const latest = errors.slice(-3);
  const lines = latest.map((e) => `${e.path}: ${e.message}`);
  if (count > 3) {
    lines.push(`... and ${count - 3} more errors`);
  }
  new import_obsidian13.Notice(
    t("status.errors", { count: String(count) }) + "\n" + lines.join("\n"),
    8e3
  );
}

// src/sync-manager.ts
var app2;
var settings2;
var vaultId2 = "";
var lastSyncAt = { value: "" };
var isRemote = { value: false };
var pendingQueue = [];
var debounceTimer = null;
var syncIntervalTimer = null;
var onStatusChange = null;
function initSyncManager(obsidianApp, pluginSettings, userId, vault, statusCb) {
  app2 = obsidianApp;
  settings2 = pluginSettings;
  vaultId2 = vault;
  onStatusChange = statusCb;
  initBinarySync(app2, vault, pluginSettings);
  registerVaultEvents();
}
function setVaultId(id) {
  vaultId2 = id;
}
function startPolling() {
  stopPolling();
  if (settings2.syncInterval > 0 && vaultId2) {
    syncIntervalTimer = window.setInterval(() => {
      void pullChanges2();
    }, settings2.syncInterval * 6e4);
  }
}
function stopPolling() {
  if (syncIntervalTimer !== null) {
    window.clearInterval(syncIntervalTimer);
    syncIntervalTimer = null;
  }
}
async function pullChanges2() {
  await pullChanges({
    app: app2,
    settings: settings2,
    vaultId: vaultId2,
    lastSyncAt,
    isRemoteChange: isRemote,
    onStatusChange,
    flushQueue,
    onProgress: null
  });
}
async function fullSync2(onProgress) {
  await pushAllLocalFiles();
  await fullSync({
    app: app2,
    settings: settings2,
    vaultId: vaultId2,
    lastSyncAt,
    isRemoteChange: isRemote,
    onStatusChange,
    flushQueue,
    onProgress: onProgress || null
  });
}
function registerVaultEvents() {
  const vault = app2.vault;
  vault.on("modify", (file) => {
    if (file instanceof import_obsidian14.TFile)
      enqueueChange(file.path, "modify");
  });
  vault.on("create", (file) => {
    if (file instanceof import_obsidian14.TFile)
      enqueueChange(file.path, "create");
  });
  vault.on("delete", (file) => {
    if (file instanceof import_obsidian14.TFile)
      enqueueChange(file.path, "delete");
  });
  vault.on("rename", (file, oldPath) => {
    if (file instanceof import_obsidian14.TFile)
      enqueueRename(oldPath, file.path);
  });
}
function enqueueChange(path, type) {
  if (isRemote.value)
    return;
  if (!isSyncableFile(path))
    return;
  if (isExcluded2(path))
    return;
  if (duplicatePending(path, type))
    return;
  pendingQueue.push({ path, type, isRemote: false, timestamp: Date.now() });
  setPendingCount(pendingQueue.length);
  scheduleFlush();
}
function enqueueRename(oldPath, newPath) {
  if (isRemote.value)
    return;
  const oldOk = isSyncableFile(oldPath);
  const newOk = isSyncableFile(newPath);
  if (!oldOk && !newOk)
    return;
  if (oldOk && !newOk) {
    pendingQueue.push({
      path: oldPath,
      type: "delete",
      isRemote: false,
      timestamp: Date.now()
    });
  } else if (!oldOk && newOk) {
    pendingQueue.push({
      path: newPath,
      type: "create",
      isRemote: false,
      timestamp: Date.now()
    });
  } else {
    pendingQueue.push({
      path: newPath,
      type: "rename",
      oldPath,
      isRemote: false,
      timestamp: Date.now()
    });
  }
  scheduleFlush();
}
function duplicatePending(path, type) {
  return pendingQueue.some(
    (c) => c.path === path && c.type === type && Date.now() - c.timestamp < DEBOUNCE_MS * 2
  );
}
function scheduleFlush() {
  if (debounceTimer !== null)
    window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    void flushQueue();
  }, DEBOUNCE_MS);
}
async function flushQueue() {
  if (pendingQueue.length === 0)
    return;
  if (!vaultId2)
    return;
  if (!getAccessToken()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed)
      return;
  }
  const batch = [...pendingQueue];
  pendingQueue = [];
  const deduped = dedupeChanges(batch);
  if (onStatusChange)
    onStatusChange("pushing");
  for (const change of deduped) {
    try {
      await pushChange(change);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn(`[SupSync] Push failed for ${change.path}:`, err);
      addSyncError(change.path, msg);
    }
  }
  setPendingCount(pendingQueue.length);
  if (onStatusChange)
    onStatusChange("idle");
  if (settings2.autoSyncEnabled) {
    try {
      await pullChanges2();
    } catch (err) {
      console.warn("[SupSync] Auto-pull after push failed:", err);
    }
  }
}
function dedupeChanges(changes) {
  const byPath = /* @__PURE__ */ new Map();
  for (const c of changes) {
    const existing = byPath.get(c.path);
    if (!existing || c.timestamp > existing.timestamp) {
      byPath.set(c.path, c);
    }
  }
  return [...byPath.values()];
}
async function pushChange(change) {
  if (isBinaryFile(change.path)) {
    await pushBinaryFile(change.path, change.type, change.oldPath);
    return;
  }
  await pushTextChange(change);
}
async function pushTextChange(change) {
  const vault = app2.vault;
  if (change.type === "delete") {
    await softDeleteNote(vaultId2, change.path);
    return;
  }
  if (change.type === "rename" && change.oldPath) {
    await renameNote(vaultId2, change.oldPath, change.path);
    return;
  }
  const file = vault.getAbstractFileByPath(change.path);
  if (!(file instanceof import_obsidian14.TFile))
    return;
  const content = await vault.read(file);
  await upsertNote(vaultId2, change.path, content);
}
function isSyncableFile(path) {
  return SYNCABLE_ALL_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
}
function isExcluded2(path) {
  const configDir = app2.vault.configDir;
  if (path.startsWith(configDir + "/") || path === configDir)
    return true;
  return settings2.excludedPaths.some(
    (p) => matchGlob(p, path)
  );
}
async function pushAllLocalFiles() {
  const vault = app2.vault;
  const files = vault.getFiles();
  for (const file of files) {
    if (!isSyncableFile(file.path))
      continue;
    if (isExcluded2(file.path))
      continue;
    if (pendingQueue.some((c) => c.path === file.path))
      continue;
    pendingQueue.push({
      path: file.path,
      type: "create",
      isRemote: false,
      timestamp: Date.now()
    });
  }
  setPendingCount(pendingQueue.length);
}
function cleanup() {
  stopPolling();
  if (debounceTimer !== null)
    window.clearTimeout(debounceTimer);
  pendingQueue = [];
}

// src/views/dashboard-view.ts
var import_obsidian15 = require("obsidian");
var DashboardView = class extends import_obsidian15.ItemView {
  constructor(leaf, getVaultId, getVaultName, syncNowFn) {
    super(leaf);
    this.getVaultId = getVaultId;
    this.getVaultName = getVaultName;
    this.syncNowFn = syncNowFn;
  }
  getViewType() {
    return VIEW_TYPE_DASHBOARD;
  }
  getDisplayText() {
    const name = this.getVaultName();
    return name ? `SupSync: ${name}` : "SupSync Dashboard";
  }
  getIcon() {
    return "refresh-cw";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("supsync-dashboard");
    const header = contentEl.createDiv({ cls: "supsync-dash-header" });
    header.createSpan({ text: t("dashboard.title"), cls: "supsync-dash-title" });
    if (this.getVaultName()) {
      const info = contentEl.createDiv({ cls: "supsync-dash-info" });
      info.createEl("p", { text: t("dashboard.vault", { name: this.getVaultName() }) });
    }
    const actions = contentEl.createDiv({ cls: "supsync-dash-actions" });
    this.actionButton(actions, t("dashboard.syncNow"), () => {
      void this.syncNowFn();
    });
    this.actionButton(actions, t("dashboard.fullSync"), () => {
      clearSyncErrors();
      void (async () => {
        if (!getAccessToken()) {
          new import_obsidian15.Notice(t("plugin.signInFirst"));
          return;
        }
        const progress = new import_obsidian15.Notice(t("sync.starting"), 0);
        await fullSync2((current, total) => {
          progress.setMessage(t("sync.progress", {
            current: String(current),
            total: String(total)
          }));
        });
        progress.hide();
        new import_obsidian15.Notice(t("plugin.syncComplete"));
      })();
    });
  }
  actionButton(container, text, onClick) {
    const btn = container.createEl("button", { cls: "supsync-dash-btn" });
    btn.createSpan({ text });
    btn.addEventListener("click", onClick);
  }
  async onClose() {
    this.contentEl.empty();
  }
};

// src/main.ts
var SYNC_CONFIG_FILENAME = ".supsync-config.json";
var SETTINGS_SHARED_FILENAME = ".supsync-settings.json";
var lockManager;
var realtimeManager;
var SupSyncPlugin = class extends import_obsidian16.Plugin {
  constructor() {
    super(...arguments);
    this.vaultId = "";
    this.vaultName = "";
    this.currentUserId = "";
    this.sessionCheckTimer = null;
  }
  async onload() {
    await this.loadSettings();
    initLocale();
    setSupabaseSettings(this.settings);
    setPersistCallback((access, refresh) => {
      void (async () => {
        const data = { ...this.settings };
        if (refresh)
          data._refreshToken = refresh;
        if (access)
          data._accessToken = access;
        await this.saveData(data);
      })();
    });
    lockManager = new LockManager(this.settings, (path, lockedBy) => {
      if (lockedBy) {
        new import_obsidian16.Notice(t("plugin.isEditing", { user: lockedBy, path }));
      }
    });
    realtimeManager = new RealtimeManager(
      this.settings.supabaseUrl,
      (path, userId, action) => {
        if (action === "acquired" && userId) {
          new import_obsidian16.Notice(t("plugin.lockAcquired", { path }));
        } else if (action === "released") {
          new import_obsidian16.Notice(t("plugin.lockReleased", { path }));
        }
      }
    );
    this.registerCommands();
    this.addRibbonIcon("refresh-cw", "Sync now", () => {
      clearSyncErrors();
      void this.syncNow();
    });
    const statusItem = this.addStatusBarItem();
    registerStatusBar(statusItem, () => {
      clearSyncErrors();
      void this.syncNow();
    });
    this.addSettingTab(new SupSyncSettingTab(this.app, this));
    this.registerView(
      VIEW_TYPE_DASHBOARD,
      (leaf) => new DashboardView(
        leaf,
        () => this.vaultId,
        () => this.vaultName,
        () => this.syncNow()
      )
    );
    this.app.workspace.onLayoutReady(() => {
      void this.activateView(VIEW_TYPE_DASHBOARD);
    });
    await this.restoreSession();
    this.startSessionCheck();
    this.checkWhatsNew();
  }
  onunload() {
    void (async () => {
      if (this.sessionCheckTimer !== null) {
        window.clearInterval(this.sessionCheckTimer);
        this.sessionCheckTimer = null;
      }
      stopPolling();
      cleanup();
      await lockManager.releaseAll();
      realtimeManager.disconnect();
    })();
  }
  // --- Settings ---
  async loadSettings() {
    const data = await this.loadData();
    const settingsData = data ? { ...data } : {};
    const storedRefresh = settingsData._refreshToken || "";
    const storedAccess = settingsData._accessToken || "";
    delete settingsData._refreshToken;
    delete settingsData._accessToken;
    this.settings = { ...DEFAULT_SETTINGS, ...settingsData };
    if (storedAccess) {
      setAccessToken(storedAccess);
    }
    if (storedRefresh) {
      setRefreshToken(storedRefresh);
    }
    const sharedFile = this.app.vault.getAbstractFileByPath(SETTINGS_SHARED_FILENAME);
    if (sharedFile instanceof import_obsidian16.TFile) {
      try {
        const content = await this.app.vault.read(sharedFile);
        const shared = JSON.parse(content);
        this.settings = { ...this.settings, ...shared };
      } catch (e) {
      }
    }
  }
  async saveSettings() {
    const dataToSave = { ...this.settings };
    const rt = getRefreshToken();
    if (rt)
      dataToSave._refreshToken = rt;
    const at = getAccessToken();
    if (at)
      dataToSave._accessToken = at;
    await this.saveData(dataToSave);
    setSupabaseSettings(this.settings);
    try {
      const existing = this.app.vault.getAbstractFileByPath(SETTINGS_SHARED_FILENAME);
      const json = JSON.stringify(this.settings, null, 2);
      if (existing instanceof import_obsidian16.TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(SETTINGS_SHARED_FILENAME, json);
      }
    } catch (e) {
    }
  }
  // --- Session restoration ---
  async restoreSession() {
    const config = await this.loadVaultConfig();
    if (!config)
      return;
    this.vaultId = config.vaultId;
    this.vaultName = config.vaultName;
    setVaultId(this.vaultId);
    if (!getAccessToken() && getRefreshToken()) {
      await refreshAccessToken();
    }
    let user = await getCurrentUser();
    if (!user && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        user = await getCurrentUser();
      }
    }
    if (user) {
      this.currentUserId = user.id;
      setCurrentUserId(user.id);
      initSyncManager(
        this.app,
        this.settings,
        this.currentUserId,
        this.vaultId,
        (s) => {
          setSyncState(s);
        }
      );
      startPolling();
      realtimeManager.connect(this.vaultId);
      new import_obsidian16.Notice(t("plugin.connected", { email: user.email, vault: this.vaultName }));
    }
  }
  checkWhatsNew() {
    const currentVersion = this.manifest.version;
    const lastSeen = this.settings.lastSeenVersion;
    if (lastSeen !== currentVersion) {
      window.setTimeout(() => {
        new WhatsNewModal(this.app, lastSeen).open();
        this.settings.lastSeenVersion = currentVersion;
        void this.saveSettings();
      }, 1e3);
    }
  }
  startSessionCheck() {
    const CHECK_INTERVAL_MS = 30 * 60 * 1e3;
    this.sessionCheckTimer = window.setInterval(() => {
      void (async () => {
        if (!getRefreshToken())
          return;
        const user = await getCurrentUser();
        if (!user) {
          const refreshed = await refreshAccessToken();
          if (!refreshed)
            return;
          const reconnected = await getCurrentUser();
          if (reconnected) {
            this.currentUserId = reconnected.id;
            setCurrentUserId(reconnected.id);
            if (!this.vaultId) {
              const config = await this.loadVaultConfig();
              if (config) {
                this.vaultId = config.vaultId;
                this.vaultName = config.vaultName;
                setVaultId(this.vaultId);
              }
            }
            if (this.vaultId) {
              initSyncManager(
                this.app,
                this.settings,
                this.currentUserId,
                this.vaultId,
                (s) => {
                  setSyncState(s);
                }
              );
              startPolling();
              realtimeManager.connect(this.vaultId);
            }
          }
        } else {
          await refreshAccessToken();
        }
      })();
    }, CHECK_INTERVAL_MS);
  }
  // --- Vault config ---
  async saveVaultConfig(vaultId3, vaultName) {
    const config = { vaultId: vaultId3, vaultName };
    const path = SYNC_CONFIG_FILENAME;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian16.TFile) {
      await this.app.vault.modify(existing, JSON.stringify(config, null, 2));
    } else {
      await this.app.vault.create(path, JSON.stringify(config, null, 2));
    }
  }
  async loadVaultConfig() {
    try {
      const file = this.app.vault.getAbstractFileByPath(SYNC_CONFIG_FILENAME);
      if (file instanceof import_obsidian16.TFile) {
        const content = await this.app.vault.read(file);
        return JSON.parse(content);
      }
    } catch (e) {
    }
    try {
      const exists = await this.app.vault.adapter.exists(SYNC_CONFIG_FILENAME);
      if (exists) {
        const content = await this.app.vault.adapter.read(SYNC_CONFIG_FILENAME);
        return JSON.parse(content);
      }
    } catch (e) {
    }
    return null;
  }
  // --- Public API ---
  get syncManager() {
    return { fullSync: () => fullSync2() };
  }
  openOnboarding() {
    new OnboardModal(this.app).open();
  }
  onAuthSuccess(email) {
    void (async () => {
      if (!this.vaultId) {
        const config = await this.loadVaultConfig();
        if (config) {
          this.vaultId = config.vaultId;
          this.vaultName = config.vaultName;
          setVaultId(this.vaultId);
        }
      }
      if (this.vaultId) {
        initSyncManager(
          this.app,
          this.settings,
          this.currentUserId,
          this.vaultId,
          (s) => {
            setSyncState(s);
          }
        );
        startPolling();
        realtimeManager.connect(this.vaultId);
        new import_obsidian16.Notice(t("plugin.connected", { email, vault: this.vaultName }));
      } else {
        new import_obsidian16.Notice(t("plugin.signInPrompt", { email }));
      }
    })();
  }
  async syncNow() {
    if (!this.vaultId) {
      new import_obsidian16.Notice(t("plugin.setupFirst"));
      return;
    }
    if (!getAccessToken()) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        new import_obsidian16.Notice(t("plugin.signInFirst"));
        return;
      }
    }
    clearSyncErrors();
    const progress = new import_obsidian16.Notice(t("sync.starting"), 0);
    await fullSync2((current, total) => {
      progress.setMessage(t("sync.progress", {
        current: String(current),
        total: String(total)
      }));
    });
    progress.hide();
    new import_obsidian16.Notice(t("plugin.syncComplete"));
  }
  async activateView(viewType) {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(viewType);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(true);
      if (!leaf)
        return;
      await leaf.setViewState({ type: viewType, active: true });
    }
    if (leaf) {
      workspace.setActiveLeaf(leaf, { focus: true });
    }
  }
  // --- Commands ---
  registerCommands() {
    this.addCommand({
      id: "sync-now",
      name: t("cmd.syncNow"),
      callback: () => {
        void this.syncNow();
      }
    });
    this.addCommand({
      id: "sign-in",
      name: t("cmd.signIn"),
      callback: () => {
        this.openLogin();
      }
    });
    this.addCommand({
      id: "sign-out",
      name: t("cmd.signOut"),
      callback: () => {
        void (async () => {
          realtimeManager.disconnect();
          await signOut();
          stopPolling();
          cleanup();
          await lockManager.releaseAll();
          clearSyncErrors();
          this.currentUserId = "";
          setCurrentUserId("");
          await this.saveData({ ...this.settings });
          new import_obsidian16.Notice(t("plugin.signedOut"));
        })();
      }
    });
    this.addCommand({
      id: "setup-vault",
      name: t("cmd.createVault"),
      callback: () => {
        void this.setupVault();
      }
    });
    this.addCommand({
      id: "join-vault",
      name: t("cmd.joinVault"),
      callback: () => {
        this.openJoinVault();
      }
    });
    this.addCommand({
      id: "open-setup-wizard",
      name: t("cmd.openWizard"),
      callback: () => {
        this.openOnboarding();
      }
    });
    this.addCommand({
      id: "open-settings",
      name: t("cmd.openSettings"),
      callback: () => {
        this.app.setting.open();
        this.app.setting.openTabById(this.manifest.id);
      }
    });
  }
  // --- Auth ---
  openLogin() {
    new LoginModal(this.app, (success) => {
      if (success)
        void this.onLoginSuccess();
    }).open();
  }
  async onLoginSuccess() {
    const user = await getCurrentUser();
    if (!user) {
      new import_obsidian16.Notice(t("plugin.verifyLogin"));
      return;
    }
    this.currentUserId = user.id;
    setCurrentUserId(user.id);
    if (this.vaultId) {
      initSyncManager(
        this.app,
        this.settings,
        this.currentUserId,
        this.vaultId,
        (s) => {
          setSyncState(s);
        }
      );
      startPolling();
      realtimeManager.connect(this.vaultId);
      new import_obsidian16.Notice(t("plugin.connected", { email: user.email, vault: this.vaultName }));
    } else {
      new import_obsidian16.Notice(t("plugin.signInPrompt", { email: user.email }));
    }
  }
  // --- Vault setup ---
  async createVault() {
    await this.setupVault();
  }
  async joinVault(vaultId3) {
    await this.joinVaultImpl(vaultId3);
  }
  async setupVault() {
    if (!getAccessToken()) {
      new import_obsidian16.Notice(t("plugin.signInFirst"));
      return;
    }
    if (!this.currentUserId) {
      const user = await getCurrentUser();
      if (user) {
        this.currentUserId = user.id;
        setCurrentUserId(user.id);
      } else {
        new import_obsidian16.Notice(t("plugin.signInFirst"));
        return;
      }
    }
    const vaultName = this.app.vault.getName();
    try {
      const vault = await createVault(vaultName);
      this.vaultId = vault.id;
      this.vaultName = vault.name;
      setVaultId(this.vaultId);
      await this.saveVaultConfig(vault.id, vault.name);
      this.initAndAnnounce(vault.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      new import_obsidian16.Notice(t("plugin.vaultCreateFailed", { error: msg }));
    }
  }
  async joinVaultImpl(vaultId3) {
    if (!getAccessToken()) {
      throw new Error(t("plugin.signInFirst"));
    }
    if (!this.currentUserId) {
      const user = await getCurrentUser();
      if (user) {
        this.currentUserId = user.id;
        setCurrentUserId(user.id);
      } else {
        throw new Error(t("plugin.signInFirst"));
      }
    }
    const vault = await getVault(vaultId3);
    if (!vault)
      throw new Error(t("join.error.notFound"));
    await joinVault(vaultId3);
    this.vaultId = vaultId3;
    this.vaultName = vault.name;
    setVaultId(vaultId3);
    await this.saveVaultConfig(vaultId3, vault.name);
    this.initAndAnnounce(vault.name);
  }
  initAndAnnounce(vaultName) {
    initSyncManager(
      this.app,
      this.settings,
      this.currentUserId,
      this.vaultId,
      (s) => {
        setSyncState(s);
      }
    );
    startPolling();
    realtimeManager.connect(this.vaultId);
    new import_obsidian16.Notice(t("plugin.connected", { email: "", vault: vaultName }));
  }
  openJoinVault() {
    if (!getAccessToken()) {
      new import_obsidian16.Notice(t("plugin.signInFirst"));
      return;
    }
    new JoinVaultModal(this.app, (vaultId3, vaultName) => {
      void (async () => {
        this.vaultId = vaultId3;
        this.vaultName = vaultName;
        setVaultId(vaultId3);
        await this.saveVaultConfig(vaultId3, vaultName);
        this.initAndAnnounce(vaultName);
      })();
    }).open();
  }
};
