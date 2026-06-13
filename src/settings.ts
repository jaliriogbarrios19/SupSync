import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type SupSyncPlugin from "./main";
import type { SupSyncSettings } from "./types";
import { t } from "./i18n";
import { ExclusionPickerModal } from "./exclusion-picker-modal";
import {
    signIn, signUp, signOut, getCurrentUser,
    getAccessToken, setCurrentUserId,
} from "./supabase-client";

export class SupSyncSettingTab extends PluginSettingTab {
    plugin: SupSyncPlugin;
    private userEmail = "";

    constructor(app: App, plugin: SupSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        void this.render().catch((err) => {
            console.error("[SupSync] Settings render failed:", err);
        });
    }

    private async render(): Promise<void> {
        const { containerEl } = this;
        containerEl.empty();

        await this.checkAuth();
        this.renderAuthSection(containerEl);

        new Setting(containerEl)
            .setName(t("settings.heading.supabase"))
            .setHeading();

        new Setting(containerEl)
            .setName(t("settings.url"))
            .setDesc(t("settings.url.desc"))
            .addText((text) =>
                text
                    .setPlaceholder(t("settings.url.placeholder"))
                    .setValue(this.plugin.settings.supabaseUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.supabaseUrl = value.trim();
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName(t("settings.anonKey"))
            .setDesc(t("settings.anonKey.desc"))
            .addText((text) => {
                text.setPlaceholder(t("settings.anonKey.placeholder"))
                    .setValue(this.plugin.settings.supabaseAnonKey);
                text.inputEl.type = "password";
                text.onChange(async (value) => {
                    this.plugin.settings.supabaseAnonKey = value.trim();
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(t("settings.heading.sync"))
            .setHeading();

        new Setting(containerEl)
            .setName(t("settings.syncInterval"))
            .setDesc(t("settings.syncInterval.desc"))
            .addText((text) =>
                text
                    .setPlaceholder(t("settings.syncInterval.placeholder"))
                    .setValue(String(this.plugin.settings.syncInterval))
                    .onChange(async (value) => {
                        const n = parseInt(value, 10);
                        this.plugin.settings.syncInterval = isNaN(n) ? 0 : Math.max(0, n);
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName(t("settings.conflictMode"))
            .setDesc(t("settings.conflictMode.desc"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("local-wins", t("settings.conflictMode.local"))
                    .addOption("remote-wins", t("settings.conflictMode.remote"))
                    .addOption("ask", t("settings.conflictMode.ask"))
                    .setValue(this.plugin.settings.conflictMode)
                    .onChange(async (value) => {
                        this.plugin.settings.conflictMode = value as SupSyncSettings["conflictMode"];
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName(t("settings.storageLimit"))
            .setDesc(t("settings.storageLimit.desc"))
            .addText((text) =>
                text
                    .setPlaceholder(t("settings.storageLimit.placeholder"))
                    .setValue(String(this.plugin.settings.storageLimitMB))
                    .onChange(async (value) => {
                        const n = parseInt(value, 10);
                        this.plugin.settings.storageLimitMB = isNaN(n) ? 1024 : Math.max(1, n);
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName(t("settings.heading.excluded"))
            .setHeading();

        this.renderExclusionsSection(containerEl);

        new Setting(containerEl)
            .setName(t("settings.heading.vault"))
            .setHeading();

        new Setting(containerEl)
            .setName(t("settings.setupWizard"))
            .setDesc(t("settings.setupWizard.desc"))
            .addButton((btn) =>
                btn.setButtonText(t("settings.setupWizard.btn")).onClick(() => {
                    this.plugin.openOnboarding();
                }),
            );

        new Setting(containerEl)
            .setName(t("settings.syncNow"))
            .setDesc(t("settings.syncNow.desc"))
            .addButton((btn) =>
                btn.setButtonText(t("settings.syncNow.btn")).onClick(() => {
                    void (async () => {
                        await this.plugin.syncManager.fullSync();
                    })();
                }),
            );
    }

    private async checkAuth(): Promise<void> {
        try {
            if (getAccessToken()) {
                const user = await getCurrentUser();
                this.userEmail = user?.email || "";
            } else {
                this.userEmail = "";
            }
        } catch {
            this.userEmail = "";
        }
    }

    private renderAuthSection(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName(t("settings.heading.account"))
            .setHeading();

        if (this.userEmail) {
            const info = new Setting(containerEl);
            info.setName(t("settings.auth.signedIn"))
                .setDesc(this.userEmail);
            info.addButton((btn) =>
                btn.setButtonText(t("settings.auth.signOut"))
                    .onClick(() => {
                        void (async () => {
                            await signOut();
                            this.plugin.currentUserId = "";
                            setCurrentUserId("");
                            new Notice(t("plugin.signedOut"));
                            void this.render();
                        })();
                    }),
            );
            return;
        }

        const formContainer = containerEl.createDiv("supsync-login-settings");

        const emailRow = formContainer.createDiv("supsync-login-row");
        emailRow.createEl("label", { text: t("login.email") });
        const emailInput = emailRow.createEl("input", {
            type: "email",
            placeholder: t("login.email.placeholder"),
        });

        const passRow = formContainer.createDiv("supsync-login-row");
        passRow.createEl("label", { text: t("login.password") });
        const passInput = passRow.createEl("input", {
            type: "password",
            placeholder: t("login.password.placeholder"),
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
                    window.setTimeout(() => { void this.render(); }, 800);
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
                    if (data?.session) {
                        this.plugin.currentUserId = data.user.id;
                        setCurrentUserId(data.user.id);
                        this.plugin.onAuthSuccess(data.user.email);
                        msgEl.textContent = t("login.success.signedIn");
                        msgEl.className = "supsync-login-msg supsync-msg-success";
                        window.setTimeout(() => { void this.render(); }, 800);
                    } else {
                        msgEl.textContent = t("login.success.signedIn");
                        msgEl.className = "supsync-login-msg supsync-msg-success";
                        window.setTimeout(() => { void this.render(); }, 1500);
                    }
                } catch (err) {
                    msgEl.textContent = err instanceof Error ? err.message : t("login.error.failed");
                    msgEl.className = "supsync-login-msg supsync-msg-error";
                }
            })();
        });
    }

    private renderExclusionsSection(containerEl: HTMLElement): void {
        const desc = containerEl.createDiv();
        desc.createEl("p", {
            text: t("settings.excludedPaths.desc"),
            cls: "setting-item-description",
        });

        const tagsContainer = containerEl.createDiv("supsync-exclusion-tags");
        this.renderExclusionTags(tagsContainer);

        const browseSetting = new Setting(containerEl);
        browseSetting.addButton((btn) =>
            btn.setButtonText(t("settings.excludedPaths.browse"))
                .setCta()
                .onClick(() => {
                    new ExclusionPickerModal(
                        this.app,
                        this.plugin.settings.excludedPaths,
                        (selected) => {
                            void (async () => {
                                const merged = new Set([
                                    ...this.plugin.settings.excludedPaths,
                                    ...selected,
                                ]);
                                this.plugin.settings.excludedPaths = [...merged];
                                await this.plugin.saveSettings();
                                void this.render();
                            })();
                        },
                    ).open();
                }),
        );
        browseSetting.addButton((btn) =>
            btn.setButtonText(t("settings.excludedPaths.clearAll"))
                .onClick(() => {
                    void (async () => {
                        this.plugin.settings.excludedPaths = [];
                        await this.plugin.saveSettings();
                        void this.render();
                    })();
                }),
        );
    }

    private renderExclusionTags(container: HTMLElement): void {
        container.empty();
        const paths = this.plugin.settings.excludedPaths;

        if (paths.length === 0) {
            container.createEl("p", {
                text: t("settings.excludedPaths.empty"),
                cls: "supsync-exclusion-empty",
            });
            return;
        }

        for (const path of paths) {
            const tag = container.createSpan("supsync-exclusion-tag");
            tag.createSpan({ text: path });
            const removeBtn = tag.createSpan("supsync-exclusion-tag-remove");
            removeBtn.textContent = "×";
            removeBtn.addEventListener("click", () => {
                void (async () => {
                    this.plugin.settings.excludedPaths =
                        this.plugin.settings.excludedPaths.filter((p) => p !== path);
                    await this.plugin.saveSettings();
                    this.renderExclusionTags(container);
                })();
            });
        }
    }
}
