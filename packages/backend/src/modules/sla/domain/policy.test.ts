import { it, expect } from "vitest";
import { validateTargets, pauses, type Target } from "./policy";
const targets: Target[] = ["acknowledgment", "intervention", "resolution"].map(
  (kind) => ({
    kind: kind as Target["kind"],
    durationSeconds: 3600,
    countingMode: "business_hours",
    pauseReasons: [],
  }),
);
it("requires three valid positive targets and explicit pauses", () => {
  expect(() => validateTargets(targets)).not.toThrow();
  expect(() =>
    validateTargets(targets.map((t) => ({ ...t, durationSeconds: 0 }))),
  ).toThrow();
  expect(() => validateTargets(targets.slice(1))).toThrow();
  expect(pauses(targets[0]!, null)).toBe(false);
  expect(pauses(targets[0]!, "external")).toBe(false);
  expect(
    pauses({ ...targets[0]!, pauseReasons: ["external"] }, "external"),
  ).toBe(true);
});
