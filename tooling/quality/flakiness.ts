import type { Test } from "./model.ts";
export function repetitions(runs: Test[][]) {
  if (runs.length < 2 || !runs[0]?.length)
    throw Error("At least two populated repetitions required");
  const expected = runs[0]
    .map((t) => t.id)
    .sort()
    .join("\n");
  for (const run of runs)
    if (
      run
        .map((t) => t.id)
        .sort()
        .join("\n") !== expected ||
      new Set(run.map((t) => t.id)).size !== run.length
    )
      throw Error("Missing/duplicate repeated tests");
  return {
    repetitions: runs.length,
    tests: runs[0].map((t) => {
      const attempts = runs.map((r) => r.find((x) => x.id === t.id)!);
      const passes = attempts.filter(
          (t) => t.final_status === "passed" && !t.retry_count,
        ).length,
        failures = attempts.length - passes;
      return {
        id: t.id,
        tags: t.tags,
        attempts: attempts.length,
        passes,
        failures,
        flaky: passes > 0 && failures > 0,
        failure_rate: failures / attempts.length,
      };
    }),
  };
}
