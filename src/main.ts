import {
    Notice, Plugin, TFile, WorkspaceLeaf,
} from "obsidian";
import type { SupSyncSettings, SyncConfigData } from "./types";
import { DEFAULT_SETTINGS, VIEW_TYPE_DASHBOARD } from "./types";
import { SupSyncSettingTab } from "./settings";
import { LoginModal } from "./login-modal";
import { OnboardModal } from "./onboard-modal";
import { JoinVaultModal } from "./join-vault-modal";
import { LockManager } from "./lock-manager";
import { RealtimeManager } from "./realtime-manager";
import {
    setSupabaseSettings, getAccessToken, getRefreshToken, setRefreshToken, setAccessToken,
    signOut, getCurrentUser, setCurrentUserId, setPersistCallback,
    refreshAccessToken,
} from "./supabase-client";
import { createVault } from "./supabase-api";
import {
    initSyncManager, setVaultId,
    startPolling, stopPolling,
    fullSync, cleanup as cleanupSync,
} from "./sync-manager";
import { initLocale, t } from "./i18n";
import { registerStatusBar, setSyncState, clearSyncErrors } from "./status-bar";
import { DashboardView } from "./views/dashboard-view";

const SYNC_CONFIG_FILENAME = ".supsync-config.json";
const SETTINGS_SHARED_FILENAME = ".supsync-settings.json";

let lockManager: LockManager;
let realtimeManager: RealtimeManager;

export default class SupSyncPlugin extends Plugin {
    settings!: SupSyncSettings;
    vaultId = "";
    vaultName = "";
    currentUserId = "";

    async onload(): Promise<void> {
        await this.loadSettings();
        initLocale();
        setSupabaseSettings(this.settings);
        setPersistCallback((access, refresh) => {
            void (async () => {
                const data: Record<string, unknown> = { ...this.settings };
                if (refresh) data._refreshToken = refresh;
                if (access) data._accessToken = access;
                await this.saveData(data);
            })();
        });

        lockManager = new LockManager(this.settings, (path, lockedBy) => {
            if (lockedBy) {
                new Notice(t("plugin.isEditing", { user: lockedBy, path }));
            }
        });

        realtimeManager = new RealtimeManager(
            this.settings.supabaseUrl,
            (path, userId, action) => {
                if (action === "acquired" && userId) {
                    new Notice(t("plugin.lockAcquired", { path }));
                } else if (action === "released") {
                    new Notice(t("plugin.lockReleased", { path }));
                }
            },
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
            (leaf) => new DashboardView(leaf,
                () => this.vaultId,
                () => this.vaultName,
                () => this.syncNow()
            ),
        );

        this.app.workspace.onLayoutReady(() => {
            void this.activateView(VIEW_TYPE_DASHBOARD);
        });

        await this.restoreSession();
    }

    onunload(): void {
        void (async () => {
            stopPolling();
            cleanupSync();
            await lockManager.releaseAll();
            realtimeManager.disconnect();
        })();
    }

    // --- Settings ---

    async loadSettings(): Promise<void> {
        const data = await this.loadData() as Record<string, unknown> | null;
        const settingsData = data ? { ...data } : {};
        const storedRefresh = (settingsData._refreshToken as string) || "";
        const storedAccess = (settingsData._accessToken as string) || "";
        delete settingsData._refreshToken;
        delete settingsData._accessToken;
        this.settings = { ...DEFAULT_SETTINGS, ...(settingsData as Partial<SupSyncSettings>) };

        if (storedAccess) {
            setAccessToken(storedAccess);
        }
        if (storedRefresh) {
            setRefreshToken(storedRefresh);
        }

        const sharedFile = this.app.vault.getAbstractFileByPath(SETTINGS_SHARED_FILENAME);
        if (sharedFile instanceof TFile) {
            try {
                const content = await this.app.vault.read(sharedFile);
                const shared = JSON.parse(content) as Partial<SupSyncSettings>;
                this.settings = { ...this.settings, ...shared };
            } catch {
                // ignore parse errors
            }
        }
    }

    async saveSettings(): Promise<void> {
        const dataToSave: Record<string, unknown> = { ...this.settings };
        const rt = getRefreshToken();
        if (rt) dataToSave._refreshToken = rt;
        const at = getAccessToken();
        if (at) dataToSave._accessToken = at;
        await this.saveData(dataToSave);
        setSupabaseSettings(this.settings);

        try {
            const existing = this.app.vault.getAbstractFileByPath(SETTINGS_SHARED_FILENAME);
            const json = JSON.stringify(this.settings, null, 2);
            if (existing instanceof TFile) {
                await this.app.vault.modify(existing, json);
            } else {
                await this.app.vault.create(SETTINGS_SHARED_FILENAME, json);
            }
        } catch {
            // vault may not be ready
        }
    }

    // --- Session restoration ---

    private async restoreSession(): Promise<void> {
        const config = await this.loadVaultConfig();

        if (!config) return;

        this.vaultId = config.vaultId;
        this.vaultName = config.vaultName;
        setVaultId(this.vaultId);

        if (!getAccessToken() && getRefreshToken()) {
            await refreshAccessToken();
        }

        const user = await getCurrentUser();

        if (user) {
            this.currentUserId = user.id;
            setCurrentUserId(user.id);
            initSyncManager(
                this.app, this.settings,
                this.currentUserId, this.vaultId,
                (s) => { setSyncState(s as "idle" | "pushing" | "pulling" | "error"); },
            );
            startPolling();
            realtimeManager.connect(this.vaultId);
            new Notice(t("plugin.connected", { email: user.email, vault: this.vaultName }));
        }
    }

    // --- Vault config ---

    async saveVaultConfig(vaultId: string, vaultName: string): Promise<void> {
        const config: SyncConfigData = { vaultId, vaultName };
        const path = SYNC_CONFIG_FILENAME;
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing instanceof TFile) {
            await this.app.vault.modify(existing, JSON.stringify(config, null, 2));
        } else {
            await this.app.vault.create(path, JSON.stringify(config, null, 2));
        }
    }

    async loadVaultConfig(): Promise<SyncConfigData | null> {
        try {
            const file = this.app.vault.getAbstractFileByPath(SYNC_CONFIG_FILENAME);
            if (file instanceof TFile) {
                const content = await this.app.vault.read(file);
                return JSON.parse(content) as SyncConfigData;
            }
        } catch {
            // No config yet
        }

        try {
            const exists = await this.app.vault.adapter.exists(SYNC_CONFIG_FILENAME);
            if (exists) {
                const content = await this.app.vault.adapter.read(SYNC_CONFIG_FILENAME);
                return JSON.parse(content) as SyncConfigData;
            }
        } catch {
            // adapter fallback failed
        }

        return null;
    }

    // --- Public API ---

    get syncManager() {
        return { fullSync: () => fullSync() };
    }

    openOnboarding(): void {
        new OnboardModal(this.app).open();
    }

    onAuthSuccess(email: string): void {
        void (async () => {
            if (this.vaultId) {
                initSyncManager(
                    this.app, this.settings,
                    this.currentUserId, this.vaultId, (s) => { setSyncState(s as "idle" | "pushing" | "pulling" | "error"); },
                );
                startPolling();
                realtimeManager.connect(this.vaultId);
                new Notice(t("plugin.connected", { email, vault: this.vaultName }));
            } else {
                new Notice(t("plugin.signInPrompt", { email }));
            }
        })();
    }

    private async syncNow(): Promise<void> {
        if (!this.vaultId) {
            new Notice(t("plugin.setupFirst"));
            return;
        }
        if (!getAccessToken()) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                new Notice(t("plugin.signInFirst"));
                return;
            }
        }
        clearSyncErrors();

        const progress = new Notice(t("sync.starting"), 0);
        await fullSync((current, total) => {
            progress.setMessage(t("sync.progress", {
                current: String(current),
                total: String(total),
            }));
        });
        progress.hide();
        new Notice(t("plugin.syncComplete"));
    }

    private async activateView(viewType: string): Promise<void> {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(viewType);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getLeaf(true);
            if (!leaf) return;
            await leaf.setViewState({ type: viewType, active: true });
        }

        if (leaf) {
            workspace.setActiveLeaf(leaf, { focus: true });
        }
    }

    // --- Commands ---

    private registerCommands(): void {
        this.addCommand({
            id: "sync-now",
            name: t("cmd.syncNow"),
            callback: () => { void this.syncNow(); },
        });

        this.addCommand({
            id: "sign-in",
            name: t("cmd.signIn"),
            callback: () => { this.openLogin(); },
        });

        this.addCommand({
            id: "sign-out",
            name: t("cmd.signOut"),
            callback: () => {
                void (async () => {
                    realtimeManager.disconnect();
                    await signOut();
                    stopPolling();
                    cleanupSync();
                    await lockManager.releaseAll();
                    clearSyncErrors();
                    this.currentUserId = "";
                    setCurrentUserId("");
                    await this.saveData({ ...this.settings });
                    new Notice(t("plugin.signedOut"));
                })();
            },
        });

        this.addCommand({
            id: "setup-vault",
            name: t("cmd.createVault"),
            callback: () => { void this.setupVault(); },
        });

        this.addCommand({
            id: "join-vault",
            name: t("cmd.joinVault"),
            callback: () => { this.openJoinVault(); },
        });

        this.addCommand({
            id: "open-setup-wizard",
            name: t("cmd.openWizard"),
            callback: () => { this.openOnboarding(); },
        });

        this.addCommand({
            id: "open-settings",
            name: t("cmd.openSettings"),
            callback: () => {
                this.app.setting.open();
                this.app.setting.openTabById(this.manifest.id);
            },
        });
    }

    // --- Auth ---

    private openLogin(): void {
        new LoginModal(this.app, (success) => {
            if (success) void this.onLoginSuccess();
        }).open();
    }

    private async onLoginSuccess(): Promise<void> {
        const user = await getCurrentUser();
        if (!user) {
            new Notice(t("plugin.verifyLogin"));
            return;
        }
        this.currentUserId = user.id;
        setCurrentUserId(user.id);

        if (this.vaultId) {
            initSyncManager(
                this.app, this.settings,
                this.currentUserId, this.vaultId, (s) => { setSyncState(s as "idle" | "pushing" | "pulling" | "error"); },
            );
            startPolling();
            realtimeManager.connect(this.vaultId);
            new Notice(t("plugin.connected", { email: user.email, vault: this.vaultName }));
        } else {
            new Notice(t("plugin.signInPrompt", { email: user.email }));
        }
    }

    // --- Vault setup ---

    private async setupVault(): Promise<void> {
        if (!getAccessToken()) {
            new Notice(t("plugin.signInFirst"));
            return;
        }
        const vaultName = this.app.vault.getName();
        try {
            const vault = await createVault(vaultName);
            this.vaultId = vault.id;
            this.vaultName = vault.name;
            setVaultId(this.vaultId);
            await this.saveVaultConfig(vault.id, vault.name);
            initSyncManager(
                this.app, this.settings,
                this.currentUserId, this.vaultId, (s) => { setSyncState(s as "idle" | "pushing" | "pulling" | "error"); },
            );
            startPolling();
            realtimeManager.connect(this.vaultId);
            new Notice(t("plugin.vaultCreated", { name: vaultName }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            new Notice(t("plugin.vaultCreateFailed", { error: msg }));
        }
    }

    private openJoinVault(): void {
        if (!getAccessToken()) {
            new Notice(t("plugin.signInFirst"));
            return;
        }
        new JoinVaultModal(this.app, (vaultId, vaultName) => {
            void (async () => {
                this.vaultId = vaultId;
                this.vaultName = vaultName;
                setVaultId(vaultId);
                await this.saveVaultConfig(vaultId, vaultName);
                initSyncManager(
                    this.app, this.settings,
                    this.currentUserId, this.vaultId, (s) => { setSyncState(s as "idle" | "pushing" | "pulling" | "error"); },
                );
                startPolling();
                realtimeManager.connect(this.vaultId);
                new Notice(t("plugin.joined", { vault: vaultName }));
            })();
        }).open();
    }
}
