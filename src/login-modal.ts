import { App, Modal, Setting } from "obsidian";
import { signIn, signUp } from "./supabase-client";

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

        new Setting(contentEl).setName(this.mode === "login" ? "Sign in to SupSync" : "Create account").setHeading();

        this.messageEl = contentEl.createDiv({ cls: "supsync-login-message" });

        const form = contentEl.createDiv({ cls: "supsync-login-form" });

        form.createEl("label", { text: "Email" });
        this.emailEl = form.createEl("input", { type: "email", placeholder: "you@example.com" }) as HTMLInputElement;

        form.createEl("label", { text: "Password" });
        this.passwordEl = form.createEl("input", { type: "password", placeholder: "Your password" }) as HTMLInputElement;

        const btnRow = form.createDiv({ cls: "supsync-login-buttons" });

        const submitBtn = btnRow.createEl("button", {
            text: this.mode === "login" ? "Sign in" : "Register",
        });
        submitBtn.addEventListener("click", () => {
            void this.submit();
        });

        const toggleBtn = btnRow.createEl("button", {
            text: this.mode === "login" ? "Create account" : "Sign in instead",
            cls: "supsync-toggle-btn",
        });
        toggleBtn.addEventListener("click", () => {
            this.mode = this.mode === "login" ? "register" : "login";
            this.onOpen();
        });

        const cancelBtn = btnRow.createEl("button", {
            text: "Cancel",
            cls: "supsync-cancel-btn",
        });
        cancelBtn.addEventListener("click", () => this.close());
    }

    private async submit(): Promise<void> {
        const email = this.emailEl.value.trim();
        const password = this.passwordEl.value;
        if (!email || !password) {
            this.showMessage("Please fill in both fields.", "error");
            return;
        }

        this.showMessage("Please wait...", "info");

        try {
            if (this.mode === "register") {
                await signUp(email, password);
                this.showMessage("Account created! Check your email for confirmation, then sign in.", "success");
                this.mode = "login";
                window.setTimeout(() => {
                    if (!this.closed) this.onOpen();
                }, 2000);
                return;
            }

            await signIn(email, password);
            this.showMessage("Signed in!", "success");
            window.setTimeout(() => {
                this.callback(true);
                this.close();
            }, 800);
        } catch (err) {
            this.showMessage(
                err instanceof Error ? err.message : "Authentication failed",
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
