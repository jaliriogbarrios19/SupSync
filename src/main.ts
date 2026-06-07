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
        setSupabaseSettings(this.settings);

        lockManager = new LockManager(this.settings, (path, lockedBy) => {
            if (lockedBy) {
                new Notice(`SupSync: ${lockedBy} is editing ${path}`);
            }
        });

        realtimeManager = new RealtimeManager(
            this.settings.supabaseUrl,
            (path, userId, action) => {
                if (action === "acquired" && userId) {
                    new Notice(`SupSync: Lock acquired on ${path}`);
                } else if (action === "released") {
                    new Notice(`SupSync: ${path} is now free to edit`);
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
                new Notice(`SupSync: Connected as ${user.email} to ${this.vaultName}`);
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
            new Notice("SupSync: Set up your vault first. Use the setup wizard.");
            return;
        }
        if (!getAccessToken()) {
            new Notice("SupSync: Sign in first.");
            return;
        }
        await fullSync();
    }

    // --- Commands ---

    private registerCommands(): void {
        this.addCommand({
            id: "supsync-sync-now",
            name: "Sync now",
            callback: () => { void this.syncNow(); },
        });

        this.addCommand({
            id: "supsync-sign-in",
            name: "Sign in",
            callback: () => { this.openLogin(); },
        });

        this.addCommand({
            id: "supsync-sign-out",
            name: "Sign out",
            callback: async () => {
                realtimeManager.disconnect();
                await signOut();
                stopPolling();
                cleanupSync();
                lockManager.releaseAll();
                this.currentUserId = "";
                setCurrentUserId("");
                new Notice("SupSync: Signed out.");
            },
        });

        this.addCommand({
            id: "supsync-setup-vault",
            name: "Create shared vault",
            callback: () => { void this.setupVault(); },
        });

        this.addCommand({
            id: "supsync-join-vault",
            name: "Join vault",
            callback: () => { this.openJoinVault(); },
        });

        this.addCommand({
            id: "supsync-open-setup-wizard",
            name: "Open setup wizard",
            callback: () => { this.openOnboarding(); },
        });

        this.addCommand({
            id: "supsync-open-settings",
            name: "Open settings",
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
            new Notice("SupSync: Could not verify login.");
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
            new Notice(`SupSync: Connected as ${user.email} to ${this.vaultName}`);
        } else {
            new Notice(`SupSync: Signed in as ${user.email}. Use 'Create shared vault' or 'Join vault'.`);
        }
    }

    // --- Vault setup ---

    private async setupVault(): Promise<void> {
        if (!getAccessToken()) {
            new Notice("SupSync: Sign in first.");
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
            new Notice(`SupSync: Vault '${vaultName}' created! Share with your team.`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            new Notice(`SupSync: Failed to create vault: ${msg}`);
        }
    }

    private openJoinVault(): void {
        if (!getAccessToken()) {
            new Notice("SupSync: Sign in first.");
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
            new Notice(`SupSync: Joined '${vaultName}'!`);
        }).open();
    }
}
