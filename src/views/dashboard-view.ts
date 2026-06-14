import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { VIEW_TYPE_DASHBOARD } from "../types";
import { getAccessToken } from "../supabase-client";
import { fullSync } from "../sync-manager";
import { clearSyncErrors } from "../status-bar";
import { t } from "../i18n";

export class DashboardView extends ItemView {
    private getVaultId: () => string;
    private getVaultName: () => string;
    private syncNowFn: () => Promise<void>;

    constructor(
        leaf: WorkspaceLeaf,
        getVaultId: () => string,
        getVaultName: () => string,
        syncNowFn: () => Promise<void>,
    ) {
        super(leaf);
        this.getVaultId = getVaultId;
        this.getVaultName = getVaultName;
        this.syncNowFn = syncNowFn;
    }

    getViewType(): string {
        return VIEW_TYPE_DASHBOARD;
    }

    getDisplayText(): string {
        const name = this.getVaultName();
        return name ? `SupSync: ${name}` : "SupSync Dashboard";
    }

    getIcon(): string {
        return "refresh-cw";
    }

    async onOpen(): Promise<void> {
        await this.render();
    }

    async render(): Promise<void> {
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
                    new Notice(t("plugin.signInFirst"));
                    return;
                }
                const progress = new Notice(t("sync.starting"), 0);
                await fullSync((current, total) => {
                    progress.setMessage(t("sync.progress", {
                        current: String(current),
                        total: String(total),
                    }));
                });
                progress.hide();
                new Notice(t("plugin.syncComplete"));
            })();
        });
    }

    private actionButton(container: HTMLElement, text: string, onClick: () => void): void {
        const btn = container.createEl("button", { cls: "supsync-dash-btn" });
        btn.createSpan({ text });
        btn.addEventListener("click", onClick);
    }

    async onClose(): Promise<void> {
        this.contentEl.empty();
    }
}
