import { Notice } from "obsidian";
import { t } from "./i18n";

let statusBarItem: HTMLElement | null = null;
let pendingCount = 0;
let syncState: "idle" | "pushing" | "pulling" | "error" = "idle";
let errors: Array<{ path: string; message: string }> = [];
let onSyncTap: (() => void) | null = null;

export function registerStatusBar(item: HTMLElement, tapCb: () => void): void {
    statusBarItem = item;
    onSyncTap = tapCb;
    item.addClass("supsync-status-bar-item");
    item.setText("SupSync");
    item.setAttribute("aria-label", "SupSync: tap to sync");
    item.addEventListener("click", () => {
        if (errors.length > 0) {
            showErrorSummary();
        } else if (onSyncTap) {
            onSyncTap();
        }
    });
}

export function setPendingCount(n: number): void {
    pendingCount = n;
    render();
}

export function setSyncState(state: "idle" | "pushing" | "pulling" | "error"): void {
    syncState = state;
    render();
}

export function addSyncError(path: string, message: string): void {
    errors.push({ path, message });
    if (errors.length > 20) errors.shift();
    render();
}

export function clearSyncErrors(): void {
    errors = [];
    render();
}

function render(): void {
    if (!statusBarItem) return;

    const parts: string[] = [];

    if (syncState === "error") {
        parts.push("⚠");
    } else if (syncState === "pushing") {
        parts.push("↑");
    } else if (syncState === "pulling") {
        parts.push("↓");
    }

    if (pendingCount > 0) {
        parts.push(String(pendingCount));
    }

    if (errors.length > 0) {
        parts.push(`(${errors.length})`);
    }

    statusBarItem.setText(parts.join(" ") || "SupSync");
    statusBarItem.setAttribute("aria-label", getTooltip());
}

function getTooltip(): string {
    const lines: string[] = [];
    if (pendingCount > 0) lines.push(`${pendingCount} changes pending`);
    if (errors.length > 0) lines.push(`${errors.length} sync errors`);
    lines.push("Tap to sync");
    return lines.join(" — ");
}

function showErrorSummary(): void {
    const count = errors.length;
    if (count === 0) return;

    const latest = errors.slice(-3);
    const lines = latest.map((e) => `${e.path}: ${e.message}`);
    if (count > 3) {
        lines.push(`... and ${count - 3} more errors`);
    }

    new Notice(
        t("status.errors", { count: String(count) }) + "\n" + lines.join("\n"),
        8000,
    );
}
