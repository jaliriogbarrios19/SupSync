import { App, Modal, Setting } from "obsidian";
import { joinVault, getVault } from "./supabase-api";
import { t } from "./i18n";

export class JoinVaultModal extends Modal {
    private vaultIdEl!: HTMLInputElement;
    private messageEl!: HTMLElement;
    private callback: (vaultId: string, vaultName: string) => void;
    private closed = false;

    constructor(app: App, callback: (vaultId: string, vaultName: string) => void) {
        super(app);
        this.callback = callback;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("supsync-login-modal");

        new Setting(contentEl).setName(t("join.title")).setHeading();

        contentEl.createEl("p", {
            text: t("join.description"),
            cls: "supsync-msg-info",
        });

        this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });

        const form = contentEl.createDiv({ cls: "supsync-login-form" });

        form.createEl("label", { text: t("join.label") });
        this.vaultIdEl = form.createEl("input", {
            type: "text",
            placeholder: t("join.placeholder"),
        });

        const btnRow = form.createDiv({ cls: "supsync-login-buttons" });

        const joinBtn = btnRow.createEl("button", { text: t("join.btn.join") });
        joinBtn.addEventListener("click", () => {
            void this.submit();
        });

        const cancelBtn = btnRow.createEl("button", {
            text: t("join.btn.cancel"),
            cls: "supsync-cancel-btn",
        });
        cancelBtn.addEventListener("click", () => this.close());
    }

    private async submit(): Promise<void> {
        const vaultId = this.vaultIdEl.value.trim();
        if (!vaultId) {
            this.showMessage(t("join.error.emptyId"), "error");
            return;
        }

        this.showMessage(t("join.joining"), "info");

        try {
            const vault = await getVault(vaultId);
            if (!vault) {
                this.showMessage(t("join.error.notFound"), "error");
                return;
            }

            await joinVault(vaultId);

            this.showMessage(t("join.success", { vault: vault.name }), "success");
            window.setTimeout(() => {
                if (this.closed) return;
                void this.callback(vaultId, vault.name);
                this.close();
            }, 800);
        } catch (err) {
            const msg = err instanceof Error ? err.message : t("join.error.notFound");
            this.showMessage(msg, "error");
        }
    }

    private showMessage(text: string, type: "info" | "error" | "success"): void {
        this.messageEl.empty();
        this.messageEl.createSpan({ text, cls: `supsync-msg-${type}` });
    }

    onClose(): void {
        this.closed = true;
        const { contentEl } = this;
        contentEl.empty();
    }
}
