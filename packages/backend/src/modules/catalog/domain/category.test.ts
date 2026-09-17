import { expect, it } from "vitest";
import { isPriority, priorities } from "./category";
it("accepts only the three backend-controlled priorities", () => {
  for (const value of priorities) expect(isPriority(value)).toBe(true);
  for (const value of [null, undefined, "", "critical", "URGENT", 1])
    expect(isPriority(value)).toBe(false);
});
