import { App, PluginSettingTab, Setting } from "obsidian";
import type SupSyncPlugin from "./main";
import type { SupSyncSettings } from "./types";
import { t } from "./i18n";

export class SupSyncSettingTab extends PluginSettingTab {
    plugin: SupSyncPlugin;

    constructor(app: App, plugin: SupSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        this.render();
    }

    private render(): void {
        const { containerEl } = this;
        containerEl.empty();

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

        new Setting(containerEl)
            .setName(t("settings.excludedPaths"))
            .setDesc(t("settings.excludedPaths.desc"))
            .addTextArea((text) => {
                text.setValue(this.plugin.settings.excludedPaths.join(", "))
                    .setPlaceholder(t("settings.excludedPaths.placeholder"))
                    .onChange(async (value) => {
                        this.plugin.settings.excludedPaths = value
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter((s: string) => s.length > 0);
                        await this.plugin.saveSettings();
                    });
            });

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
}
