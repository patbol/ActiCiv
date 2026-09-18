import { describe, it, expect, vi } from "vitest";
import { readQuality } from "./read";

describe("quality.read is a server capability, never a client role", () => {
  it.each([
    null,
    { userId: "x", active: false, capabilities: ["quality.read"] },
    { userId: "x", active: true, capabilities: [] },
  ])("refuses before touching evidence", async (context) => {
    const list = vi.fn();
    await expect(
      readQuality({ read: async () => context }, { list }, {}),
    ).rejects.toThrow("QUALITY_FORBIDDEN");
    expect(list).not.toHaveBeenCalled();
  });
  it("reads only after verified active platform capability", async () => {
    const list = vi.fn().mockResolvedValue({ runs: [] });
    expect(
      await readQuality(
        {
          read: async () => ({
            userId: "x",
            active: true,
            capabilities: ["quality.read"],
          }),
        },
        { list },
        {},
      ),
    ).toEqual({ runs: [] });
    expect(list).toHaveBeenCalledOnce();
  });
});
