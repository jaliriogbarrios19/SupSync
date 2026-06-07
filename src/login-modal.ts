import { App, Modal, Setting } from "obsidian";
import { signIn, signUp } from "./supabase-client";
import { t } from "./i18n";

export class LoginModal extends Modal {
    private emailEl!: HTMLInputElement;
    private passwordEl!: HTMLInputElement;
    private messageEl!: HTMLElement;
    private mode: "login" | "register" = "login";
    private callback: (success: boolean) => void;
    private closed = false;

    constructor(app: App, callback: (success: boolean) => void) {
        super(app);
        this.callback = callback;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("supsync-login-modal");

        new Setting(contentEl)
            .setName(this.mode === "login" ? t("login.title.signIn") : t("login.title.register"))
            .setHeading();

        this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });

        const form = contentEl.createDiv({ cls: "supsync-login-form" });

        form.createEl("label", { text: t("login.email") });
        this.emailEl = form.createEl("input", { type: "email", placeholder: t("login.email.placeholder") }) as HTMLInputElement;

        form.createEl("label", { text: t("login.password") });
        this.passwordEl = form.createEl("input", { type: "password", placeholder: t("login.password.placeholder") }) as HTMLInputElement;

        const btnRow = form.createDiv({ cls: "supsync-login-buttons" });

        const submitBtn = btnRow.createEl("button", {
            text: this.mode === "login" ? t("login.btn.signIn") : t("login.btn.register"),
        });
        submitBtn.addEventListener("click", () => {
            void this.submit();
        });

        const toggleBtn = btnRow.createEl("button", {
            text: this.mode === "login" ? t("login.btn.toggleIn") : t("login.btn.toggleOut"),
            cls: "supsync-toggle-btn",
        });
        toggleBtn.addEventListener("click", () => {
            this.mode = this.mode === "login" ? "register" : "login";
            this.onOpen();
        });

        const cancelBtn = btnRow.createEl("button", {
            text: t("login.btn.cancel"),
            cls: "supsync-cancel-btn",
        });
        cancelBtn.addEventListener("click", () => this.close());
    }

    private async submit(): Promise<void> {
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
                    if (!this.closed) this.onOpen();
                }, 2000);
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
                "error",
            );
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
