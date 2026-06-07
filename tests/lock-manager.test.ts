import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupSyncSettings } from "../src/types";
import { DEFAULT_SETTINGS } from "../src/types";

const mockAcquireLock = vi.fn();
const mockRefreshLock = vi.fn();
const mockReleaseLock = vi.fn();
const mockGetActiveLock = vi.fn();
const mockGetAccessToken = vi.fn();

vi.mock("../src/supabase-api", () => ({
    acquireLock: (...args: unknown[]) => mockAcquireLock(...args),
    refreshLock: (...args: unknown[]) => mockRefreshLock(...args),
    releaseLock: (...args: unknown[]) => mockReleaseLock(...args),
    getActiveLock: (...args: unknown[]) => mockGetActiveLock(...args),
}));

vi.mock("../src/supabase-client", () => ({
    getAccessToken: () => mockGetAccessToken(),
}));

import { LockManager } from "../src/lock-manager";

function createLockManager(
    onLockChanged: (path: string, lockedBy: string | null) => void = () => {},
): LockManager {
    return new LockManager({ ...DEFAULT_SETTINGS }, onLockChanged);
}

beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockReturnValue("fake-token");
});

describe("LockManager", () => {
    describe("isLockedLocally", () => {
        it("returns false when no locks are held", () => {
            const lm = createLockManager();
            expect(lm.isLockedLocally("v1", "nota.md")).toBe(false);
        });

        it("returns true after acquiring a lock", async () => {
            const lm = createLockManager();
            mockGetActiveLock.mockResolvedValue(null);
            mockAcquireLock.mockResolvedValue({
                id: "lock-1",
                vault_id: "v1",
                path: "nota.md",
                user_id: "user-1",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            const acquired = await lm.tryAcquire("v1", "nota.md");
            expect(acquired).toBe(true);
            expect(lm.isLockedLocally("v1", "nota.md")).toBe(true);
        });

        it("returns false for a different path", async () => {
            const lm = createLockManager();
            mockGetActiveLock.mockResolvedValue(null);
            mockAcquireLock.mockResolvedValue({
                id: "lock-1",
                vault_id: "v1",
                path: "nota.md",
                user_id: "user-1",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            await lm.tryAcquire("v1", "nota.md");
            expect(lm.isLockedLocally("v1", "otra.md")).toBe(false);
        });
    });

    describe("tryAcquire", () => {
        it("returns false when not authenticated", async () => {
            mockGetAccessToken.mockReturnValue("");
            const lm = createLockManager();
            const result = await lm.tryAcquire("v1", "nota.md");
            expect(result).toBe(false);
        });

        it("acquires lock when none exists remotely", async () => {
            const lm = createLockManager();
            mockGetActiveLock.mockResolvedValue(null);
            mockAcquireLock.mockResolvedValue({
                id: "lock-1", vault_id: "v1", path: "nota.md",
                user_id: "user-1",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            const result = await lm.tryAcquire("v1", "nota.md");
            expect(result).toBe(true);
            expect(mockAcquireLock).toHaveBeenCalledWith("v1", "nota.md");
        });

        it("returns false when another user holds the lock", async () => {
            const onLockChanged = vi.fn();
            const lm = createLockManager(onLockChanged);

            mockGetActiveLock.mockResolvedValue({
                id: "lock-other", vault_id: "v1", path: "nota.md",
                user_id: "other-user",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            const result = await lm.tryAcquire("v1", "nota.md");
            expect(result).toBe(false);
            expect(onLockChanged).toHaveBeenCalledWith("nota.md", "other-user");
            expect(mockAcquireLock).not.toHaveBeenCalled();
        });

        it("returns true when already holding the lock", async () => {
            const lm = createLockManager();
            mockGetActiveLock.mockResolvedValue(null);
            mockAcquireLock.mockResolvedValue({
                id: "lock-1", vault_id: "v1", path: "nota.md",
                user_id: "user-1",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            await lm.tryAcquire("v1", "nota.md");
            mockAcquireLock.mockClear();

            const result = await lm.tryAcquire("v1", "nota.md");
            expect(result).toBe(true);
            expect(mockAcquireLock).not.toHaveBeenCalled();
        });
    });

    describe("release", () => {
        it("stops heartbeat and calls release API", async () => {
            const lm = createLockManager();
            mockGetActiveLock.mockResolvedValue(null);
            mockAcquireLock.mockResolvedValue({
                id: "lock-1", vault_id: "v1", path: "nota.md",
                user_id: "user-1",
                acquired_at: new Date().toISOString(),
                expires_at: new Date().toISOString(),
            });

            await lm.tryAcquire("v1", "nota.md");
            lm.release("v1", "nota.md");

            expect(lm.isLockedLocally("v1", "nota.md")).toBe(false);
            expect(mockReleaseLock).toHaveBeenCalledWith("lock-1");
        });

        it("is a no-op for paths not held", () => {
            const lm = createLockManager();
            lm.release("v1", "nope.md");
            expect(mockReleaseLock).not.toHaveBeenCalled();
        });
    });
});
