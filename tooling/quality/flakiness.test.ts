import { expect, it } from "vitest";
import { repetitions } from "./flakiness";
const test = {
  id: "critical",
  final_status: "passed",
  retry_count: 0,
  flaky: false,
  duration_ms: 1,
  tags: ["@critical"],
};
it("classifies intentional repetitions separately from retries", () => {
  const r = repetitions([
    [test],
    [{ ...test, final_status: "failed" }],
    [test],
  ]);
  expect(r.tests[0]).toMatchObject({
    attempts: 3,
    passes: 2,
    failures: 1,
    flaky: true,
    failure_rate: 1 / 3,
  });
  expect(() => repetitions([[test], []])).toThrow();
});
