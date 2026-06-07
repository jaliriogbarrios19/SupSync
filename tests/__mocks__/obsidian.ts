import { vi } from "vitest";

export class TFile {
    path = "";
    stat = { mtime: 0, ctime: 0, size: 0 };
}

export class TFolder {
    children: unknown[] = [];
}

export class Vault {
    getAbstractFileByPath = vi.fn().mockReturnValue(null);
    read = vi.fn().mockResolvedValue("");
    modify = vi.fn().mockResolvedValue(undefined);
    create = vi.fn().mockResolvedValue(undefined);
    createBinary = vi.fn().mockResolvedValue(undefined);
    trash = vi.fn().mockResolvedValue(undefined);
    readBinary = vi.fn().mockResolvedValue(new ArrayBuffer(0));
    getResourcePath = vi.fn().mockReturnValue("");
    getName = vi.fn().mockReturnValue("test-vault");
    delete = vi.fn().mockResolvedValue(undefined);
    adapter = { remove: vi.fn(), list: vi.fn(), exists: vi.fn() };
    configDir = ".obsidian";
    on = vi.fn();
}

export class FileManager {
    trashFile = vi.fn().mockResolvedValue(undefined);
}

export class App {
    vault = new Vault();
    fileManager = new FileManager();
    setting = { open: vi.fn(), openTabById: vi.fn() };
}

export class Notice {
    constructor(_msg: string, _timeout?: number) {}
}

export class Plugin {
    app = new App();
    manifest = { id: "supsync" };
    loadData = vi.fn().mockResolvedValue(null);
    saveData = vi.fn().mockResolvedValue(undefined);
    addCommand = vi.fn();
    addRibbonIcon = vi.fn();
    addStatusBarItem = vi.fn(() => document.createElement("div"));
    addSettingTab = vi.fn();
    registerEvent = vi.fn();
}

export class PluginSettingTab {
    app: App;
    plugin: Plugin;
    containerEl = document.createElement("div");
    constructor(app: App, plugin: Plugin) {
        this.app = app;
        this.plugin = plugin;
    }
}

export class Modal {
    app: App;
    contentEl = document.createElement("div");
    constructor(app: App) {
        this.app = app;
    }
    open(): void {}
    close(): void {}
}

export class Setting {
    containerEl: HTMLElement;
    constructor(el: HTMLElement) {
        this.containerEl = el;
    }
    setName(_name: string): this { return this; }
    setDesc(_desc: string): this { return this; }
    setHeading(): this { return this; }
    addText(_cb: unknown): this { return this; }
    addDropdown(_cb: unknown): this { return this; }
    addTextArea(_cb: unknown): this { return this; }
    addButton(_cb: unknown): this { return this; }
}

export const requestUrl = vi.fn().mockResolvedValue({
    status: 200,
    json: null,
    text: "",
    arrayBuffer: new ArrayBuffer(0),
});

export type RequestUrlParam = Record<string, unknown>;

export function getLanguage(): string {
    return "en";
}

export function resetMocks(): void {
    requestUrl.mockReset();
}
