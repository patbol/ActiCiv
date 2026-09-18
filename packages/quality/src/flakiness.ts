import { array, check, integer, object, string } from "./model.ts";
export function flakinessEvidence(raw: unknown, identity: unknown) {
  if (raw === null)
    return check({
      status: "DEFERRED",
      reason: "Dedicated measurement not run",
      metrics: { state: "NOT_RUN", repetitions: 0, tests: [] },
    });
  const r = object(raw),
    who = object(identity);
  for (const k of ["commit_sha", "source_digest", "environment"])
    if (r[k] !== who[k]) throw Error("Flakiness provenance mismatch");
  if (r.schema_version !== 1 || r.source_unchanged !== true)
    throw Error("Invalid flakiness source");
  const first = string(r.first_observed),
    last = string(r.last_observed),
    repetitions = integer(r.repetitions);
  if (
    !Number.isFinite(Date.parse(first)) ||
    !Number.isFinite(Date.parse(last)) ||
    Date.parse(last) < Date.parse(first) ||
    !repetitions
  )
    throw Error("Invalid observation interval");
  const outcomes = array(r.outcomes).map(object);
  if (outcomes.length !== repetitions) throw Error("Incomplete repetitions");
  const failedRun = outcomes.some((o) => {
    integer(o.exit_code);
    if (!["PASS", "FAIL"].includes(string(o.status)))
      throw Error("Invalid outcome");
    return o.exit_code !== 0 || o.status !== "PASS";
  });
  const seen = new Set<string>();
  const tests = array(r.tests).map((raw) => {
    const t = object(raw),
      id = string(t.id),
      attempts = integer(t.attempts),
      passes = integer(t.passes),
      failures = integer(t.failures);
    if (
      seen.has(id) ||
      attempts !== repetitions ||
      passes + failures !== attempts ||
      t.failure_rate !== failures / attempts ||
      t.flaky !== (passes > 0 && failures > 0)
    )
      throw Error("Inconsistent repetition counts");
    seen.add(id);
    return {
      id,
      tags: array(t.tags).map(string),
      attempts,
      passes,
      failures,
      failure_rate: failures / attempts,
      flaky: passes > 0 && failures > 0,
    };
  });
  if (!tests.length) throw Error("Empty measurement");
  const flaky = tests.filter((t) => t.flaky).length,
    failures = tests.reduce((n, t) => n + t.failures, 0);
  const state = flaky
    ? "OBSERVED_FLAKY"
    : repetitions < 2 || failures || failedRun
      ? "UNKNOWN"
      : "STABLE";
  return check({
    status:
      flaky || failures || failedRun
        ? "FAIL"
        : state === "STABLE"
          ? "PASS"
          : "DEFERRED",
    flaky,
    reason: "Dedicated repetitions, never release retries",
    metrics: {
      state,
      run_id: string(r.run_id),
      repetitions,
      first_observed: first,
      last_observed: last,
      tests,
    },
  });
}
