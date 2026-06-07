import { App, PluginSettingTab, Setting } from "obsidian";
import type SupSyncPlugin from "./main";
import type { SupSyncSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

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
            .setName("Supabase Project")
            .setHeading();

        new Setting(containerEl)
            .setName("Project URL")
            .setDesc("The URL of your Supabase project (e.g., https://abcxyz.supabase.co)")
            .addText((text) =>
                text
                    .setPlaceholder("https://your-project.supabase.co")
                    .setValue(this.plugin.settings.supabaseUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.supabaseUrl = value.trim();
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Anon Key")
            .setDesc("Your Supabase project's anon/public key")
            .addText((text) => {
                text.setPlaceholder("eyJhbGciOi...")
                    .setValue(this.plugin.settings.supabaseAnonKey);
                text.inputEl.type = "password";
                text.onChange(async (value) => {
                    this.plugin.settings.supabaseAnonKey = value.trim();
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Sync")
            .setHeading();

        new Setting(containerEl)
            .setName("Sync interval (minutes)")
            .setDesc("0 = manual sync only. Polling interval for changes from server.")
            .addText((text) =>
                text
                    .setPlaceholder("0")
                    .setValue(String(this.plugin.settings.syncInterval))
                    .onChange(async (value) => {
                        const n = parseInt(value, 10);
                        this.plugin.settings.syncInterval = isNaN(n) ? 0 : Math.max(0, n);
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Conflict resolution")
            .setDesc("What happens when local and remote versions of the same note differ.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("local-wins", "Local wins")
                    .addOption("remote-wins", "Remote wins")
                    .addOption("ask", "Ask every time")
                    .setValue(this.plugin.settings.conflictMode)
                    .onChange(async (value) => {
                        this.plugin.settings.conflictMode = value as SupSyncSettings["conflictMode"];
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Storage limit (MB)")
            .setDesc("Warning threshold is set at 80% of this value. Free tier: 1024 MB.")
            .addText((text) =>
                text
                    .setPlaceholder("1024")
                    .setValue(String(this.plugin.settings.storageLimitMB))
                    .onChange(async (value) => {
                        const n = parseInt(value, 10);
                        this.plugin.settings.storageLimitMB = isNaN(n) ? 1024 : Math.max(1, n);
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Excluded paths")
            .setHeading();

        new Setting(containerEl)
            .setName("Paths to skip")
            .setDesc("Comma-separated list of path prefixes to exclude from sync.")
            .addTextArea((text) => {
                text.setValue(this.plugin.settings.excludedPaths.join(", "))
                    .setPlaceholder(".git/, .obsidian/, .trash/, .DS_Store, Thumbs.db")
                    .onChange(async (value) => {
                        this.plugin.settings.excludedPaths = value
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter((s: string) => s.length > 0);
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName("Vault")
            .setHeading();

        new Setting(containerEl)
            .setName("Setup Wizard")
            .setDesc("Walk through the step-by-step setup to connect this vault to Supabase.")
            .addButton((btn) =>
                btn.setButtonText("Open setup wizard").onClick(() => {
                    this.plugin.openOnboarding();
                }),
            );

        new Setting(containerEl)
            .setName("Sync now")
            .setDesc("Force a full sync with the server.")
            .addButton((btn) =>
                btn.setButtonText("Sync now").onClick(() => {
                    void (async () => {
                        await this.plugin.syncManager.fullSync();
                    })();
                }),
            );
    }
}
