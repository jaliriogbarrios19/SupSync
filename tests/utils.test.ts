import { describe, it, expect } from "vitest";
import {
    isSyncableFile, dedupeChanges, type PendingChange,
} from "../src/sync-manager";
import {
    SYNCABLE_TEXT_EXTENSIONS, SYNCABLE_BINARY_EXTENSIONS,
    SYNCABLE_ALL_EXTENSIONS,
} from "../src/types";

function makeChange(
    path: string,
    type: PendingChange["type"] = "modify",
    timestamp = 1000,
): PendingChange {
    return { path, type, isRemote: false, timestamp };
}

describe("isSyncableFile", () => {
    it("matches markdown files", () => {
        expect(isSyncableFile("nota.md")).toBe(true);
        expect(isSyncableFile("carpeta/sub/nota.md")).toBe(true);
    });

    it("matches canvas files", () => {
        expect(isSyncableFile("board.canvas")).toBe(true);
    });

    it("matches excalidraw files", () => {
        expect(isSyncableFile("diagram.excalidraw")).toBe(true);
    });

    it("matches image files", () => {
        expect(isSyncableFile("foto.png")).toBe(true);
        expect(isSyncableFile("foto.jpg")).toBe(true);
        expect(isSyncableFile("icon.svg")).toBe(true);
        expect(isSyncableFile("anim.webp")).toBe(true);
        expect(isSyncableFile("frame.gif")).toBe(true);
    });

    it("matches pdf files", () => {
        expect(isSyncableFile("doc.pdf")).toBe(true);
    });

    it("matches audio files", () => {
        expect(isSyncableFile("recording.mp3")).toBe(true);
        expect(isSyncableFile("voice.wav")).toBe(true);
        expect(isSyncableFile("podcast.ogg")).toBe(true);
        expect(isSyncableFile("note.m4a")).toBe(true);
    });

    it("rejects non-syncable files", () => {
        expect(isSyncableFile("script.js")).toBe(false);
        expect(isSyncableFile("data.json")).toBe(false);
        expect(isSyncableFile("readme.txt")).toBe(false);
        expect(isSyncableFile("video.mp4")).toBe(false);
        expect(isSyncableFile(".obsidian/workspace.json")).toBe(false);
    });

    it("is case-insensitive", () => {
        expect(isSyncableFile("NOTA.MD")).toBe(true);
        expect(isSyncableFile("Foto.PNG")).toBe(true);
        expect(isSyncableFile("Doc.PDF")).toBe(true);
    });

    it("covers all declared extensions", () => {
        for (const ext of SYNCABLE_TEXT_EXTENSIONS) {
            expect(isSyncableFile(`test${ext}`)).toBe(true);
        }
        for (const ext of SYNCABLE_BINARY_EXTENSIONS) {
            expect(isSyncableFile(`file${ext}`)).toBe(true);
        }
    });

    it("SYNCABLE_ALL matches union of text + binary", () => {
        const union = [...SYNCABLE_TEXT_EXTENSIONS, ...SYNCABLE_BINARY_EXTENSIONS];
        expect(new Set(union).size).toBe(new Set(SYNCABLE_ALL_EXTENSIONS).size);
    });
});

describe("dedupeChanges", () => {
    it("returns empty for empty input", () => {
        expect(dedupeChanges([])).toEqual([]);
    });

    it("keeps single change", () => {
        const changes = [makeChange("a.md")];
        expect(dedupeChanges(changes)).toEqual(changes);
    });

    it("dedupes same path, keeps latest timestamp", () => {
        const changes = [
            makeChange("a.md", "modify", 1000),
            makeChange("a.md", "modify", 2000),
        ];
        const result = dedupeChanges(changes);
        expect(result).toHaveLength(1);
        expect(result[0].timestamp).toBe(2000);
    });

    it("keeps different paths", () => {
        const changes = [
            makeChange("a.md"),
            makeChange("b.md"),
            makeChange("c.png"),
        ];
        expect(dedupeChanges(changes)).toHaveLength(3);
    });

    it("handles rename followed by modify on same path", () => {
        const changes = [
            makeChange("x.md", "rename", 1000),
            makeChange("x.md", "modify", 2000),
        ];
        const result = dedupeChanges(changes);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("modify");
        expect(result[0].timestamp).toBe(2000);
    });
});
