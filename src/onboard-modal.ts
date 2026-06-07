import { App, Modal, Setting } from "obsidian";

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
                title: "Welcome to SupSync",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "SupSync lets you share an Obsidian vault with your team using Supabase for real-time sync and locking.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "This wizard will guide you through setting up Supabase and connecting your vault.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Estimated time: 10 minutes.",
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: "Step 1: Create a Supabase project",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "Go to https://supabase.com and sign up (or sign in).",
                    });
                    this.stepContainer.createEl("p", {
                        text: 'Click "New project" and fill in:',
                    });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: "Name: anything you like (e.g., my-team-vault)" });
                    ul.createEl("li", { text: "Database password: pick a strong one and save it" });
                    ul.createEl("li", { text: "Region: pick one close to your team" });
                    ul.createEl("li", { text: "Pricing plan: Free works for up to 500 MB database and 1 GB storage" });
                    this.stepContainer.createEl("p", {
                        text: "Click Create project and wait ~2 minutes for provisioning.",
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: "Step 2: Run the SQL setup",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "In your Supabase dashboard (https://supabase.com/dashboard), select your project.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Open the SQL Editor (left sidebar → SQL Editor).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Open the file sql/setup.sql from the SupSync plugin directory in a text editor.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Copy its ENTIRE contents and paste them into the SQL Editor.",
                    });
                    this.stepContainer.createEl("p", {
                        text: 'Click "Run" (or Ctrl+Enter). You should see "Success. No rows returned."',
                    });
                    this.stepContainer.createEl("p", {
                        text: "This creates all tables, indexes, RLS policies, and triggers needed for sync.",
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: "Step 3: Create the Storage bucket",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "Go to Storage in the left sidebar of your Supabase dashboard.",
                    });
                    this.stepContainer.createEl("p", {
                        text: 'Click "New bucket" and name it: vault-files',
                    });
                    this.stepContainer.createEl("p", {
                        text: "Check: Public bucket (files need to be accessible for download by team members).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Under bucket Policies, add these policies:",
                    });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: "SELECT: Allow authenticated users to read (bucket_id = 'vault-files')" });
                    ul.createEl("li", { text: "INSERT: Allow authenticated users to upload (bucket_id = 'vault-files')" });
                    ul.createEl("li", { text: "DELETE: Allow authenticated users to delete (bucket_id = 'vault-files')" });
                },
            },
            {
                title: "Step 4: Connect the plugin",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "Go to your Supabase project dashboard → Settings → API.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Copy the Project URL (https://your-project.supabase.co).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Copy the anon/public key (NOT the secret service_role key).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Paste both into the plugin settings (Settings → Community Plugins → SupSync).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Run the command 'SupSync: Setup vault' from the command palette.",
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: "Step 5: Create or join a vault",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "If this is the FIRST time setting up this vault:",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Use the command 'SupSync: Create shared vault' to register this vault in Supabase as an admin.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "If you're JOINING an existing vault:",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Use the command 'SupSync: Join vault' and enter the vault ID shared by your admin.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Share the vault folder with your team (via syncthing, Google Drive, git, or any file sync tool).",
                        cls: "supsync-onboard-hint",
                    });
                },
            },
            {
                title: "Step 6: Sync for the first time",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "Sign in with 'SupSync: Sign in' command (create an account if needed).",
                    });
                    this.stepContainer.createEl("p", {
                        text: "Run 'SupSync: Sync now' to pull all existing notes from the vault.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "That's it! You're now syncing.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "What gets synced:",
                        cls: "supsync-onboard-hint",
                    });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: ".md — notes" });
                    ul.createEl("li", { text: ".canvas — canvases" });
                    ul.createEl("li", { text: ".excalidraw — Excalidraw drawings" });
                    ul.createEl("li", { text: ".png, .jpg, .webp, .gif, .svg — images" });
                    ul.createEl("li", { text: ".pdf — PDF documents" });
                    ul.createEl("li", { text: ".mp3, .wav, .ogg, .m4a — audio files" });
                },
            },
            {
                title: "How locking works",
                content: () => {
                    this.stepContainer.createEl("p", {
                        text: "When you start editing a note, SupSync acquires a lock so nobody else can edit it at the same time.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "If someone else tries to edit it, they'll see a banner: 'X is editing this note'.",
                    });
                    this.stepContainer.createEl("p", {
                        text: "The lock releases automatically when you:",
                    });
                    const ul = this.stepContainer.createEl("ul");
                    ul.createEl("li", { text: "Close the note" });
                    ul.createEl("li", { text: "Stop typing for 2 minutes" });
                    ul.createEl("li", { text: "Switch to a different note" });
                    this.stepContainer.createEl("p", {
                        text: "For reading-only, no lock is needed. Anyone can read any note at any time.",
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
            text: `Step ${this.currentStep + 1} of ${this.steps.length}`,
            cls: "supsync-onboard-progress",
        });
        new Setting(header).setName(step.title).setHeading();

        this.stepContainer = contentEl.createDiv({ cls: "supsync-onboard-body" });
        step.content();

        const footer = contentEl.createDiv({ cls: "supsync-onboard-footer" });

        if (this.currentStep > 0) {
            const prevBtn = footer.createEl("button", { text: "Back" });
            prevBtn.addEventListener("click", () => {
                this.currentStep--;
                this.renderStep();
            });
        }

        if (this.currentStep < this.steps.length - 1) {
            const nextBtn = footer.createEl("button", {
                text: "Next",
                cls: "mod-cta",
            });
            nextBtn.addEventListener("click", () => {
                this.currentStep++;
                this.renderStep();
            });
        } else {
            const doneBtn = footer.createEl("button", {
                text: "Done",
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
