import { vi } from "vitest";

export const mockRequestUrl = vi.fn();

export function resetMocks(): void {
    mockRequestUrl.mockReset();
}
