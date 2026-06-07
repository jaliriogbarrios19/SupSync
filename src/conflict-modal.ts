import { App, Modal, Setting } from "obsidian";

export type ConflictChoice = "local" | "remote";

export class ConflictModal extends Modal {
    private path: string;
    private localContent: string;
    private remoteContent: string;
    private resolve!: (choice: ConflictChoice) => void;

    constructor(
        app: App,
        path: string,
        localContent: string,
        remoteContent: string,
    ) {
        super(app);
        this.path = path;
        this.localContent = localContent;
        this.remoteContent = remoteContent;
    }

    prompt(): Promise<ConflictChoice> {
        return new Promise<ConflictChoice>((resolve) => {
            this.resolve = resolve;
            this.open();
        });
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("supsync-conflict-modal");

        new Setting(contentEl).setName("Sync conflict").setHeading();
        contentEl.createEl("p", {
            text: `${this.path} was modified both locally and remotely.`,
        });

        this.renderDiff();

        const buttons = contentEl.createDiv({ cls: "supsync-conflict-buttons" });

        const localBtn = buttons.createEl("button", {
            text: "Keep local version",
            cls: "mod-cta",
        });
        localBtn.addEventListener("click", () => {
            this.resolve("local");
            this.close();
        });

        const remoteBtn = buttons.createEl("button", {
            text: "Keep remote version",
        });
        remoteBtn.addEventListener("click", () => {
            this.resolve("remote");
            this.close();
        });

        const cancelBtn = buttons.createEl("button", {
            text: "Skip for now",
            cls: "supsync-cancel-btn",
        });
        cancelBtn.addEventListener("click", () => {
            this.resolve("local");
            this.close();
        });
    }

    private renderDiff(): void {
        const { contentEl } = this;
        const diffContainer = contentEl.createDiv({ cls: "supsync-diff-container" });

        const localLabel = diffContainer.createDiv({ cls: "supsync-diff-label" });
        localLabel.createSpan({ text: "Local", cls: "supsync-diff-local-header" });

        const remoteLabel = diffContainer.createDiv({ cls: "supsync-diff-label" });
        remoteLabel.createSpan({ text: "Remote", cls: "supsync-diff-remote-header" });

        const localLines = this.localContent.split("\n");
        const remoteLines = this.remoteContent.split("\n");
        const maxLen = Math.max(localLines.length, remoteLines.length);
        const maxShow = Math.min(maxLen, 40);

        const sideBySide = diffContainer.createDiv({ cls: "supsync-diff-side" });

        for (let i = 0; i < maxShow; i++) {
            const row = sideBySide.createDiv({ cls: "supsync-diff-row" });
            const localLine = i < localLines.length ? localLines[i] : "";
            const remoteLine = i < remoteLines.length ? remoteLines[i] : "";
            const isDiff = localLine !== remoteLine;

            const localSpan = row.createSpan({
                text: localLine || "(empty)",
                cls: isDiff
                    ? "supsync-diff-changed"
                    : "supsync-diff-same",
            });

            const remoteSpan = row.createSpan({
                text: remoteLine || "(empty)",
                cls: isDiff
                    ? "supsync-diff-changed"
                    : "supsync-diff-same",
            });
        }

        if (maxLen > maxShow) {
            diffContainer.createEl("p", {
                text: `... and ${maxLen - maxShow} more lines`,
                cls: "supsync-diff-more",
            });
        }
    }

    onClose(): void {
        if (!this.resolve) return;
        this.resolve("local");
        const { contentEl } = this;
        contentEl.empty();
    }
}
