import { App, Modal, Setting, TFile, TFolder } from "obsidian";
import { SYNCABLE_ALL_EXTENSIONS } from "./types";
import { t } from "./i18n";

export class ExclusionPickerModal extends Modal {
    private readonly existingExclusions: string[];
    private readonly onConfirm: (selected: string[]) => void;
    private selectedPaths: Set<string> = new Set();

    constructor(
        app: App,
        existingExclusions: string[],
        onConfirm: (selected: string[]) => void,
    ) {
        super(app);
        this.existingExclusions = existingExclusions;
        this.onConfirm = onConfirm;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("supsync-exclusion-picker");

        contentEl.createEl("h3", { text: t("exclusionPicker.title") });
        contentEl.createEl("p", {
            text: t("exclusionPicker.description"),
            cls: "supsync-exclusion-picker-desc",
        });

        const treeContainer = contentEl.createDiv("supsync-exclusion-tree");
        const root = this.app.vault.getRoot();
        this.renderFolder(root, treeContainer, 0);

        new Setting(contentEl)
            .addButton((btn) =>
                btn.setButtonText(t("exclusionPicker.cancel"))
                    .onClick(() => { this.close(); }),
            )
            .addButton((btn) =>
                btn.setButtonText(t("exclusionPicker.confirm"))
                    .setCta()
                    .onClick(() => {
                        this.onConfirm([...this.selectedPaths]);
                        this.close();
                    }),
            );
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private renderFolder(folder: TFolder, container: HTMLElement, depth: number): void {
        const children = folder.children
            ? [...folder.children].sort((a, b) => {
                const aIsFolder = a instanceof TFolder;
                const bIsFolder = b instanceof TFolder;
                if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
                return a.name.localeCompare(b.name);
            })
            : [];

        for (const child of children) {
            if (child instanceof TFolder) {
                if (child.name.startsWith(".")) continue;
                this.renderFolderItem(child, container, depth);
            } else if (child instanceof TFile) {
                if (child.name.startsWith(".")) continue;
                this.renderFileItem(child, container, depth);
            }
        }
    }

    private renderFolderItem(folder: TFolder, container: HTMLElement, depth: number): void {
        const item = container.createDiv("supsync-exclusion-item");
        item.style.paddingLeft = `${depth * 20}px`;

        const header = item.createDiv("supsync-exclusion-item-header");

        const toggle = header.createSpan("supsync-exclusion-toggle");
        toggle.textContent = "▶";

        const checkbox = header.createEl("input", { type: "checkbox" }) as HTMLInputElement;
        const folderPath = folder.path + "/";
        checkbox.checked = this.existingExclusions.includes(folderPath)
            || this.selectedPaths.has(folderPath);

        const icon = header.createSpan("supsync-exclusion-icon");
        icon.textContent = "📁";

        const label = header.createSpan("supsync-exclusion-label");
        label.textContent = folder.name + "/";

        const childContainer = container.createDiv("supsync-exclusion-children");
        childContainer.style.display = "none";

        let expanded = false;
        let loaded = false;

        toggle.addEventListener("click", () => {
            expanded = !expanded;
            toggle.textContent = expanded ? "▼" : "▶";
            childContainer.style.display = expanded ? "block" : "none";

            if (!loaded) {
                this.renderFolder(folder, childContainer, depth + 1);
                loaded = true;
            }
        });

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                this.selectedPaths.add(folderPath);
            } else {
                this.selectedPaths.delete(folderPath);
            }
        });
    }

    private renderFileItem(file: TFile, container: HTMLElement, depth: number): void {
        const ext = "." + file.extension;
        if (!SYNCABLE_ALL_EXTENSIONS.includes(ext)) return;

        const item = container.createDiv("supsync-exclusion-item");
        item.style.paddingLeft = `${depth * 20}px`;

        const header = item.createDiv("supsync-exclusion-item-header");

        const spacer = header.createSpan("supsync-exclusion-toggle");
        spacer.textContent = " ";

        const checkbox = header.createEl("input", { type: "checkbox" }) as HTMLInputElement;
        checkbox.checked = this.existingExclusions.includes(file.path)
            || this.selectedPaths.has(file.path);

        const icon = header.createSpan("supsync-exclusion-icon");
        icon.textContent = "📄";

        const label = header.createSpan("supsync-exclusion-label");
        label.textContent = file.name;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                this.selectedPaths.add(file.path);
            } else {
                this.selectedPaths.delete(file.path);
            }
        });
    }
}
