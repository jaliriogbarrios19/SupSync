import { describe, it, expect } from "vitest";
import { resolveConflict, type ConflictAction } from "../src/sync-pull";
import { mimeFromExt } from "../src/binary-sync";
import { dedupeChanges, type PendingChange } from "../src/sync-manager";

describe("resolveConflict", () => {
    it("remote-wins always accepts remote", () => {
        expect(resolveConflict(1000, dateIso(2000), "remote-wins")).toBe("accept-remote");
        expect(resolveConflict(2000, dateIso(1000), "remote-wins")).toBe("accept-remote");
    });

    it("local-wins always keeps local", () => {
        expect(resolveConflict(1000, dateIso(2000), "local-wins")).toBe("keep-local");
        expect(resolveConflict(2000, dateIso(1000), "local-wins")).toBe("keep-local");
    });

    it("ask mode returns ask", () => {
        expect(resolveConflict(1000, dateIso(2000), "ask")).toBe("ask");
        expect(resolveConflict(2000, dateIso(1000), "ask")).toBe("ask");
    });

    it("default (newer-wins) accepts remote when remote is newer", () => {
        expect(resolveConflict(1000, dateIso(2000), "newer-wins")).toBe("accept-remote");
    });

    it("default (newer-wins) keeps local when local is newer", () => {
        expect(resolveConflict(2000, dateIso(1000), "newer-wins")).toBe("keep-local");
    });

    it("default keeps local on same timestamp", () => {
        expect(resolveConflict(1000, dateIso(1000), "newer-wins")).toBe("keep-local");
    });

    it("unknown mode behaves like newer-wins", () => {
        expect(resolveConflict(1000, dateIso(2000), "unknown")).toBe("accept-remote");
    });
});

describe("mimeFromExt", () => {
    it("returns correct MIME for images", () => {
        expect(mimeFromExt("png")).toBe("image/png");
        expect(mimeFromExt("jpg")).toBe("image/jpeg");
        expect(mimeFromExt("jpeg")).toBe("image/jpeg");
        expect(mimeFromExt("webp")).toBe("image/webp");
        expect(mimeFromExt("gif")).toBe("image/gif");
        expect(mimeFromExt("svg")).toBe("image/svg+xml");
    });

    it("returns correct MIME for documents", () => {
        expect(mimeFromExt("pdf")).toBe("application/pdf");
    });

    it("returns correct MIME for audio", () => {
        expect(mimeFromExt("mp3")).toBe("audio/mpeg");
        expect(mimeFromExt("wav")).toBe("audio/wav");
        expect(mimeFromExt("ogg")).toBe("audio/ogg");
        expect(mimeFromExt("m4a")).toBe("audio/mp4");
    });

    it("falls back to octet-stream for unknown extensions", () => {
        expect(mimeFromExt("xyz")).toBe("application/octet-stream");
        expect(mimeFromExt("")).toBe("application/octet-stream");
    });
});

describe("dedupeChanges edge cases", () => {
    it("dedupes same path with different types, keeps latest", () => {
        const changes: PendingChange[] = [
            { path: "a.md", type: "create", isRemote: false, timestamp: 1000 },
            { path: "a.md", type: "modify", isRemote: false, timestamp: 2000 },
        ];
        const result = dedupeChanges(changes);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("modify");
    });

    it("preserves order-independent dedup", () => {
        const changes: PendingChange[] = [
            { path: "b.md", type: "modify", isRemote: false, timestamp: 2000 },
            { path: "a.md", type: "create", isRemote: false, timestamp: 1000 },
        ];
        expect(dedupeChanges(changes)).toHaveLength(2);
    });

    it("keeps rename with oldPath", () => {
        const changes: PendingChange[] = [
            { path: "c.md", type: "rename", isRemote: false, timestamp: 1000, oldPath: "old.md" },
        ];
        const result = dedupeChanges(changes);
        expect(result[0].oldPath).toBe("old.md");
    });

    it("handles create-then-delete as delete (latest wins)", () => {
        const changes: PendingChange[] = [
            { path: "x.md", type: "create", isRemote: false, timestamp: 1000 },
            { path: "x.md", type: "delete", isRemote: false, timestamp: 2000 },
        ];
        const result = dedupeChanges(changes);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("delete");
    });
});

function dateIso(ms: number): string {
    return new Date(ms).toISOString();
}
