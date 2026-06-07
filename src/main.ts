import {
    App, Notice, Plugin, TFile,
} from "obsidian";
import type { SupSyncSettings, SyncConfigData } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { SupSyncSettingTab } from "./settings";
import { LoginModal } from "./login-modal";
import { OnboardModal } from "./onboard-modal";
import { JoinVaultModal } from "./join-vault-modal";
import { LockManager } from "./lock-manager";
import { RealtimeManager } from "./realtime-manager";
import {
    setSupabaseSettings, getAccessToken,
    signOut, getCurrentUser, setCurrentUserId,
} from "./supabase-client";
import { createVault } from "./supabase-api";
import {
    initSyncManager, setVaultId,
    setAccessTokenForSync, startPolling, stopPolling,
    fullSync, cleanup as cleanupSync,
} from "./sync-manager";
import { initLocale, t } from "./i18n";

const SYNC_CONFIG_FILENAME = ".supsync-config.json";

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
        this.addRibbonIcon("refresh-cw", "SupSync: Sync now", () => {
            void this.syncNow();
        });
        this.addSettingTab(new SupSyncSettingTab(this.app, this));

        await this.restoreSession();
    }

    async onunload(): Promise<void> {
        stopPolling();
        cleanupSync();
        await lockManager.releaseAll();
        realtimeManager.disconnect();
    }

    // --- Settings ---

    async loadSettings(): Promise<void> {
        const data = await this.loadData() as Partial<SupSyncSettings> | null;
        this.settings = { ...DEFAULT_SETTINGS, ...(data || {}) };
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        setSupabaseSettings(this.settings);
    }

    // --- Session restoration ---

    private async restoreSession(): Promise<void> {
        const config = await this.loadVaultConfig();
        if (config) {
            this.vaultId = config.vaultId;
            this.vaultName = config.vaultName;
            setVaultId(this.vaultId);

            const user = await getCurrentUser();
            if (user) {
                this.currentUserId = user.id;
                setCurrentUserId(user.id);
                setAccessTokenForSync(getAccessToken());
                initSyncManager(
                    this.app, this.settings,
                    this.currentUserId, this.vaultId,
                    () => {},
                );
                startPolling();
                realtimeManager.connect(this.vaultId);
                new Notice(t("plugin.connected", { email: user.email, vault: this.vaultName }));
            }
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
        return null;
    }

    // --- Public API ---

    get syncManager() {
        return { fullSync: () => fullSync() };
    }

    openOnboarding(): void {
        new OnboardModal(this.app).open();
    }

    private async syncNow(): Promise<void> {
        if (!this.vaultId) {
            new Notice(t("plugin.setupFirst"));
            return;
        }
        if (!getAccessToken()) {
            new Notice(t("plugin.signInFirst"));
            return;
        }
        await fullSync();
    }

    // --- Commands ---

    private registerCommands(): void {
        this.addCommand({
            id: "supsync-sync-now",
            name: t("cmd.syncNow"),
            callback: () => { void this.syncNow(); },
        });

        this.addCommand({
            id: "supsync-sign-in",
            name: t("cmd.signIn"),
            callback: () => { this.openLogin(); },
        });

        this.addCommand({
            id: "supsync-sign-out",
            name: t("cmd.signOut"),
            callback: async () => {
                realtimeManager.disconnect();
                await signOut();
                stopPolling();
                cleanupSync();
                lockManager.releaseAll();
                this.currentUserId = "";
                setCurrentUserId("");
                new Notice(t("plugin.signedOut"));
            },
        });

        this.addCommand({
            id: "supsync-setup-vault",
            name: t("cmd.createVault"),
            callback: () => { void this.setupVault(); },
        });

        this.addCommand({
            id: "supsync-join-vault",
            name: t("cmd.joinVault"),
            callback: () => { this.openJoinVault(); },
        });

        this.addCommand({
            id: "supsync-open-setup-wizard",
            name: t("cmd.openWizard"),
            callback: () => { this.openOnboarding(); },
        });

        this.addCommand({
            id: "supsync-open-settings",
            name: t("cmd.openSettings"),
            callback: () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const setting = (this.app as any).setting;
                if (setting) {
                    setting.open();
                    setting.openTabById(this.manifest.id);
                }
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
        setAccessTokenForSync(getAccessToken());

        if (this.vaultId) {
            initSyncManager(
                this.app, this.settings,
                this.currentUserId, this.vaultId, () => {},
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
                this.currentUserId, this.vaultId, () => {},
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
        new JoinVaultModal(this.app, async (vaultId, vaultName) => {
            this.vaultId = vaultId;
            this.vaultName = vaultName;
            setVaultId(vaultId);
            await this.saveVaultConfig(vaultId, vaultName);
            initSyncManager(
                this.app, this.settings,
                this.currentUserId, this.vaultId, () => {},
            );
            startPolling();
            realtimeManager.connect(this.vaultId);
            new Notice(t("plugin.joined", { vault: vaultName }));
        }).open();
    }
}
