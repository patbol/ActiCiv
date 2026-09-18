import {
  object,
  array,
  string,
  count,
  integer,
  check,
  summarize,
} from "./model.ts";
import type { Test, Metrics } from "./model.ts";
export function normalizeVitest(raw: unknown) {
  const r = object(raw),
    suites = array(r.testResults),
    tests: Test[] = [];
  for (const item of suites) {
    const suite = object(item);
    for (const item of array(suite.assertionResults)) {
      const a = object(item),
        status = string(a.status);
      if (!["passed", "failed", "pending", "skipped", "todo"].includes(status))
        throw Error("Unknown Vitest result");
      tests.push({
        id: string(a.fullName),
        final_status: status,
        retry_count: 0,
        flaky: false,
        duration_ms: a.duration == null ? 0 : count(a.duration),
        tags: [],
      });
    }
  }
  const result = summarize(tests, suites.length);
  if (
    !tests.length ||
    integer(r.numTotalTests) !== tests.length ||
    integer(r.numPassedTests) !== result.passed ||
    integer(r.numFailedTests) !== result.failed ||
    integer(r.numPendingTests) !== result.skipped ||
    typeof r.success !== "boolean" ||
    (r.success && result.failed > 0) ||
    (!r.success && !result.failed)
  )
    throw Error("Incomplete Vitest report");
  // Keep architecture/convention suites distinct without double counting the main total.
  result.metrics.architecture = suites
    .filter((s) =>
      /\/(architecture|conventions)\.test\.ts$/.test(string(object(s).name)),
    )
    .map((s) => {
      const row = object(s);
      return {
        suite: string(row.name).split("/").pop(),
        passed: array(row.assertionResults).filter(
          (a) => object(a).status === "passed",
        ).length,
        total: array(row.assertionResults).length,
        status: row.status,
      };
    });
  result.metrics.observability = suites
    .filter((s) =>
      /packages\/backend\/src\/platform\/(observability|logger)\.test\.ts$/.test(
        string(object(s).name),
      ),
    )
    .map((s) => {
      const row = object(s);
      return {
        suite: string(row.name).split("/").pop(),
        passed: array(row.assertionResults).filter(
          (a) => object(a).status === "passed",
        ).length,
        total: array(row.assertionResults).length,
        status: row.status,
      };
    });
  return result;
}
export function normalizePlaywright(raw: unknown) {
  const r = object(raw),
    tests: Test[] = [];
  let suiteCount = 0;
  const axe: { violations: number; incomplete: number; rules: string[] }[] = [];
  const reviews: { test_id: string; rule: string }[] = [];
  function visit(suites: unknown[]) {
    for (const item of suites) {
      const suite = object(item);
      suiteCount++;
      for (const item of array(suite.specs ?? [])) {
        const spec = object(item);
        for (const entry of array(spec.tests)) {
          const test = object(entry),
            results = array(test.results).map(object);
          if (!results.length) throw Error("Playwright test did not run");
          const last = results.at(-1)!;
          const retry = Math.max(...results.map((v) => integer(v.retry)));
          const status = string(last.status);
          if (
            ![
              "passed",
              "failed",
              "timedOut",
              "skipped",
              "interrupted",
            ].includes(status)
          )
            throw Error("Unknown Playwright status");
          tests.push({
            id: string(spec.id) + ":" + string(test.projectName),
            final_status: status,
            retry_count: retry,
            flaky:
              test.status === "flaky" || (status === "passed" && retry > 0),
            duration_ms: results.reduce((n, r) => n + count(r.duration), 0),
            tags: array(spec.tags ?? [])
              .map(string)
              .map((tag) => (tag.startsWith("@") ? tag : "@" + tag)),
          });
          for (const result of results)
            for (const item of array(result.attachments ?? [])) {
              const a = object(item);
              if (a.name !== "acticiv-axe") continue;
              const payload = object(
                JSON.parse(
                  Buffer.from(string(a.body), "base64").toString("utf8"),
                ),
              );
              for (const rule of array(payload.incomplete_rules ?? []).map(
                string,
              )) {
                if (!/^[a-z0-9-]{1,100}$/.test(rule))
                  throw Error("Invalid axe rule");
                reviews.push({
                  test_id: string(spec.id) + ":" + string(test.projectName),
                  rule,
                });
              }
              axe.push({
                violations: integer(payload.violations),
                incomplete: integer(payload.incomplete),
                rules: array(payload.rules).map(string),
              });
            }
        }
      }
      visit(array(suite.suites ?? []));
    }
  }
  visit(array(r.suites));
  if (!tests.length) throw Error("Empty Playwright report");
  const stats = object(r.stats);
  const declared = ["expected", "unexpected", "flaky", "skipped"].reduce(
    (n, k) => n + integer(stats[k]),
    0,
  );
  if (declared !== tests.length) throw Error("Incomplete Playwright report");
  const result = summarize(tests, suiteCount);
  if (array(r.errors).length) result.status = "FAIL";
  result.metrics.axe = {
    analyses: axe.length,
    violations: axe.reduce((n, a) => n + a.violations, 0),
    incomplete: axe.reduce((n, a) => n + a.incomplete, 0),
    rules: [...new Set(axe.flatMap((a) => a.rules))],
    review_status: axe.some((a) => a.incomplete > 0)
      ? "REVIEW_REQUIRED"
      : "NO_INCOMPLETE",
    reviews,
  };
  return result;
}
export function parseTap(raw: string) {
  const tests: Test[] = [];
  let plan: number | undefined;
  for (const line of raw.split(/\r?\n/)) {
    if (/^Bail out!/i.test(line)) throw Error("pgTAP bailout");
    const p = /^1\.\.(\d+)(?:\s*#.*)?$/.exec(line.trim());
    if (p) {
      if (plan !== undefined) throw Error("Duplicate TAP plan");
      plan = Number(p[1]);
      continue;
    }
    const m = /^(not ok|ok)\s+(\d+)(?:\s*-?\s*(.*))?$/.exec(line.trim());
    if (!m) continue;
    if (Number(m[2]) !== tests.length + 1)
      throw Error("Non-sequential TAP assertions");
    tests.push({
      id: m[3] || `assertion-${m[2]}`,
      final_status: /#\s*(SKIP|TODO)/i.test(m[3] ?? "")
        ? "skipped"
        : m[1] === "ok"
          ? "passed"
          : "failed",
      retry_count: 0,
      flaky: false,
      duration_ms: 0,
      tags: ["sql"],
    });
  }
  if (!plan || plan !== tests.length)
    throw Error("Missing/incomplete TAP plan");
  return summarize(tests, 1);
}
export function normalizeAudit(raw: unknown) {
  const r = object(raw);
  if (r.error) throw Error("Audit failed to execute");
  const vulnerabilities = object(object(r.metadata).vulnerabilities);
  const counts = Object.fromEntries(
    ["info", "low", "moderate", "high", "critical"].map((k) => [
      k,
      integer(vulnerabilities[k]),
    ]),
  );
  return check({
    status: counts.high! + counts.critical! > 0 ? "FAIL" : "PASS",
    metrics: { vulnerabilities: counts },
    reason: "Existing pnpm audit high severity policy",
  });
}
const names = ["statements", "branches", "functions", "lines"] as const;
function metrics(raw: unknown): Metrics {
  const r = object(raw);
  return Object.fromEntries(
    names.map((k) => {
      const m = object(r[k]),
        total = integer(m.total),
        covered = integer(m.covered);
      if (covered > total) throw Error("Invalid coverage count");
      return [
        k,
        {
          total,
          covered,
          pct: total ? Math.floor((10000 * covered) / total) / 100 : null,
        },
      ];
    }),
  ) as Metrics;
}
export const modulePaths: Record<string, string[]> = {
  "backend-critical": ["packages/backend/src/"],
  auth: ["packages/backend/src/modules/auth/"],
  "authorization-rbac": ["packages/backend/src/modules/authorization/"],
  "organizations-services": ["packages/backend/src/modules/organizations/"],
  "coverage-geography": ["packages/backend/src/modules/coverage/"],
  schedules: ["packages/backend/src/modules/schedules/"],
  sla: ["packages/backend/src/modules/sla/"],
  audit: ["packages/backend/src/modules/audit/"],
  i18n: [
    "packages/backend/src/modules/locales/",
    "packages/shared/src/locale.ts",
    "packages/shared/src/messages/",
    "apps/pro/src/i18n/",
    "apps/citizen/src/i18n/",
  ],
  "shared-ui": ["packages/shared/src/", "packages/ui/src/"],
  citizen: ["apps/citizen/src/"],
  pro: ["apps/pro/src/"],
  "tooling-conventions": ["tooling/", "scripts/"],
  "quality-center": [
    "packages/quality/src/",
    "packages/backend/src/modules/quality/",
    "packages/backend/src/platform/quality.ts",
    "apps/pro/src/app/quality/",
  ],
};
export function normalizeCoverage(raw: unknown) {
  const r = object(raw);
  const global = metrics(r.total);
  const modules: Record<string, Metrics> = {};
  for (const [name, paths] of Object.entries(modulePaths)) {
    const sum = Object.fromEntries(
      names.map((k) => [k, { total: 0, covered: 0, pct: null }]),
    ) as Metrics;
    for (const [path, value] of Object.entries(r)) {
      if (
        path === "total" ||
        !paths.some((p) => path.replaceAll("\\", "/").includes(p))
      )
        continue;
      const m = metrics(value);
      for (const k of names) {
        sum[k].total += m[k].total;
        sum[k].covered += m[k].covered;
      }
    }
    for (const k of names)
      sum[k].pct = sum[k].total
        ? Math.floor((10000 * sum[k].covered) / sum[k].total) / 100
        : null;
    modules[name] = sum;
  }
  return { global, modules };
}
