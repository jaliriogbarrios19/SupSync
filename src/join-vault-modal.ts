import { App, Modal, Notice, Setting } from "obsidian";
import { joinVault, getVault } from "./supabase-api";

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

        new Setting(contentEl).setName("Join a shared vault").setHeading();

        contentEl.createEl("p", {
            text: "Ask your vault admin for the Vault ID. You can find it in the vault's .supsync-config.json file.",
            cls: "supsync-msg-info",
        });

        this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });

        const form = contentEl.createDiv({ cls: "supsync-login-form" });

        form.createEl("label", { text: "Vault ID" });
        this.vaultIdEl = form.createEl("input", {
            type: "text",
            placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        }) as HTMLInputElement;

        const btnRow = form.createDiv({ cls: "supsync-login-buttons" });

        const joinBtn = btnRow.createEl("button", { text: "Join vault" });
        joinBtn.addEventListener("click", () => {
            void this.submit();
        });

        const cancelBtn = btnRow.createEl("button", {
            text: "Cancel",
            cls: "supsync-cancel-btn",
        });
        cancelBtn.addEventListener("click", () => this.close());
    }

    private async submit(): Promise<void> {
        const vaultId = this.vaultIdEl.value.trim();
        if (!vaultId) {
            this.showMessage("Please enter a Vault ID.", "error");
            return;
        }

        this.showMessage("Joining vault...", "info");

        try {
            const vault = await getVault(vaultId);
            if (!vault) {
                this.showMessage("Vault not found. Check the ID and try again.", "error");
                return;
            }

            await joinVault(vaultId);

            this.showMessage(`Joined '${vault.name}'!`, "success");
            window.setTimeout(() => {
                if (this.closed) return;
                void this.callback(vaultId, vault.name);
                this.close();
            }, 800);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to join vault";
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
