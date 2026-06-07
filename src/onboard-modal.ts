import { App, Modal, Setting } from "obsidian";
import { t } from "./i18n";
import { SETUP_SQL } from "./setup-sql";

interface OnboardingStep {
    title: string;
    content: () => void;
}

export class OnboardModal extends Modal {
    private currentStep = 0;
    private stepContainer!: HTMLElement;
    private steps: OnboardingStep[];

    constructor(app: App) {
        super(app);
        this.steps = this.buildSteps();
    }

    private buildSteps(): OnboardingStep[] {
        return [
            {
                title: t("onboard.step1.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step1.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step1.p2") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step1.p3"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: t("onboard.step2.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step2.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step2.p2") });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: t("onboard.step2.li1") });
                    ul.createEl("li", { text: t("onboard.step2.li2") });
                    ul.createEl("li", { text: t("onboard.step2.li3") });
                    ul.createEl("li", { text: t("onboard.step2.li4") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step2.p3"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: t("onboard.step3.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step3.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step3.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step3.p3") });

                    const sqlBlock = this.stepContainer.createEl("pre", {
                        cls: "supsync-sql-block",
                    });
                    sqlBlock.createEl("code", { text: SETUP_SQL });

                    const copyBtn = this.stepContainer.createEl("button", {
                        text: t("onboard.step3.copySql"),
                        cls: "supsync-copy-btn",
                    });
                    copyBtn.addEventListener("click", () => {
                        void (async () => {
                            try {
                                await navigator.clipboard.writeText(SETUP_SQL);
                                copyBtn.setText(t("onboard.step3.sqlCopied"));
                                window.setTimeout(() => {
                                    copyBtn.setText(t("onboard.step3.copySql"));
                                }, 2000);
                            } catch {
                                // clipboard may not be available
                            }
                        })();
                    });

                    this.stepContainer.createEl("p", { text: t("onboard.step3.p5") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step3.p6"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: t("onboard.step4.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step4.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step4.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step4.p3") });
                    this.stepContainer.createEl("p", { text: t("onboard.step4.p4") });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: t("onboard.step4.li1") });
                    ul.createEl("li", { text: t("onboard.step4.li2") });
                    ul.createEl("li", { text: t("onboard.step4.li3") });
                },
            },
            {
                title: t("onboard.step5.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step5.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step5.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step5.p3") });
                    this.stepContainer.createEl("p", { text: t("onboard.step5.p4") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step5.p5"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: t("onboard.step6.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step6.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step6.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step6.p3") });
                    this.stepContainer.createEl("p", { text: t("onboard.step6.p4") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step6.p5"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: t("onboard.step7.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step7.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step7.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step7.p3") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step7.p4"),
                        cls: "supsync-onboard-hint",
                    });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: t("onboard.step7.li1") });
                    ul.createEl("li", { text: t("onboard.step7.li2") });
                    ul.createEl("li", { text: t("onboard.step7.li3") });
                    ul.createEl("li", { text: t("onboard.step7.li4") });
                    ul.createEl("li", { text: t("onboard.step7.li5") });
                    ul.createEl("li", { text: t("onboard.step7.li6") });
                },
            },
            {
                title: t("onboard.step8.title"),
                content: () => {
                    this.stepContainer.createEl("p", { text: t("onboard.step8.p1") });
                    this.stepContainer.createEl("p", { text: t("onboard.step8.p2") });
                    this.stepContainer.createEl("p", { text: t("onboard.step8.p3") });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: t("onboard.step8.li1") });
                    ul.createEl("li", { text: t("onboard.step8.li2") });
                    ul.createEl("li", { text: t("onboard.step8.li3") });
                    this.stepContainer.createEl("p", {
                        text: t("onboard.step8.p4"),
                        cls: "supsync-onboard-hint",
                    });
                },
            },
        ];
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("supsync-onboard-modal");

        this.renderStep();
    }

    private renderStep(): void {
        const { contentEl } = this;
        contentEl.empty();

        const step = this.steps[this.currentStep];

        const header = contentEl.createDiv({ cls: "supsync-onboard-header" });
        header.createEl("span", {
            text: t("onboard.progress", {
                current: this.currentStep + 1,
                total: this.steps.length,
            }),
            cls: "supsync-onboard-progress",
        });
        new Setting(header).setName(step.title).setHeading();

        this.stepContainer = contentEl.createDiv({ cls: "supsync-onboard-body" });
        step.content();

        const footer = contentEl.createDiv({ cls: "supsync-onboard-footer" });

        if (this.currentStep > 0) {
            const prevBtn = footer.createEl("button", { text: t("onboard.btn.back") });
            prevBtn.addEventListener("click", () => {
                this.currentStep--;
                this.renderStep();
            });
        }

        if (this.currentStep < this.steps.length - 1) {
            const nextBtn = footer.createEl("button", {
                text: t("onboard.btn.next"),
                cls: "mod-cta",
            });
            nextBtn.addEventListener("click", () => {
                this.currentStep++;
                this.renderStep();
            });
        } else {
            const doneBtn = footer.createEl("button", {
                text: t("onboard.btn.done"),
                cls: "mod-cta",
            });
            doneBtn.addEventListener("click", () => this.close());
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
