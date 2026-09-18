export type Status = "PASS" | "FAIL" | "DEFERRED" | "NOT_APPLICABLE";
export type Metric = { total: number; covered: number; pct: number | null };
export type Metrics = Record<
  "statements" | "branches" | "functions" | "lines",
  Metric
>;
export type Test = {
  id: string;
  final_status: string;
  retry_count: number;
  flaky: boolean;
  duration_ms: number;
  tags: string[];
};
export type Check = {
  status: Status;
  passed: number;
  failed: number;
  skipped: number;
  retries: number;
  flaky: number;
  suites: number;
  duration_ms: number;
  tests: Test[];
  metrics: Record<string, unknown>;
  reason: string;
};
export type Identity = {
  schema_version: 1 | 2;
  project: "ActiCiv";
  commit_sha: string;
  branch: string;
  environment: string;
  created_at: string;
  producer: string;
  run_id: string;
  source_digest: string;
  dirty: boolean;
  versions: Record<string, string>;
};
export type Reference = { path: string; sha256: string };
export type Evidence = {
  identity: Identity;
  source: string;
  exit_code: number;
  duration_ms: number;
  report: unknown;
  reference: Reference;
};
export type Rule = {
  id: string;
  source: string;
  required: boolean;
  missing?: "FAIL" | "DEFERRED";
  applicable?: boolean;
  reason?: string;
};
export type Budget = {
  id: string;
  source: string;
  metric: string;
  operator: "min" | "max";
  value: number;
  mode: "advisory" | "blocking";
  approval?: { approved_by: string; approved_at: string; decision_ref: string };
};
export type Policy = {
  version: string;
  mode: "advisory";
  rules: Rule[];
  schema_version?: 2;
  budgets?: Budget[];
  promotion?: { required_checks: string[]; required_manual: string[] };
};
export type Gate = {
  blocking?: boolean;
  rule_id: string;
  status: Status;
  reason: string;
  evidence: Reference | null;
};
export type Snapshot = {
  identity: Identity;
  checks: Record<string, Check>;
  provenance: Record<string, Reference>;
  coverage: { global: Metrics; modules: Record<string, Metrics> } | null;
  gate_evaluation: {
    policy_version: string;
    policy_digest: string;
    mode: "advisory";
    status: Status;
    results: Gate[];
  };
  manual_evidence: {
    tool: string;
    status: Status;
    reference: string;
    scope: string;
  }[];
};
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Expected object");
  return value as Record<string, unknown>;
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw Error("Expected array");
  return value;
}
export function string(value: unknown): string {
  if (typeof value !== "string" || !value || value.length > 2000)
    throw Error("Expected bounded string");
  return value;
}
export function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    throw Error("Expected nonnegative number");
  return value;
}
export function integer(value: unknown): number {
  const n = count(value);
  if (!Number.isInteger(n)) throw Error("Expected integer");
  return n;
}
export function check(overrides: Partial<Check> = {}): Check {
  return {
    status: "PASS",
    passed: 0,
    failed: 0,
    skipped: 0,
    retries: 0,
    flaky: 0,
    suites: 0,
    duration_ms: 0,
    tests: [],
    metrics: {},
    reason: "completed",
    ...overrides,
  };
}
export function summarize(tests: Test[], suites: number): Check {
  const passed = tests.filter((t) => t.final_status === "passed").length;
  const skipped = tests.filter(
    (t) =>
      t.final_status === "skipped" ||
      t.final_status === "pending" ||
      t.final_status === "todo",
  ).length;
  const retries = tests.reduce((n, t) => n + t.retry_count, 0),
    flaky = tests.filter((t) => t.flaky).length;
  return check({
    passed,
    skipped,
    failed: tests.length - passed - skipped,
    retries,
    flaky,
    suites,
    tests,
    duration_ms: tests.reduce((n, t) => n + t.duration_ms, 0),
    status:
      passed === tests.length && !retries && !flaky && tests.length > 0
        ? "PASS"
        : "FAIL",
  });
}
