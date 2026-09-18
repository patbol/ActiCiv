import { execFileSync, spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, resolve, relative } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { gzipSync } from "node:zlib";
import { object, array, string } from "./model.ts";
import type { Identity, Evidence } from "./model.ts";
import { sqlReport } from "./sql.ts";
import { digest } from "./snapshot.ts";
export const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();
export function sourceDigest() {
  const hash = createHash("sha256");
  const files = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  for (const file of files) {
    hash.update(file + "\0");
    if (existsSync(file)) hash.update(readFileSync(file));
    else hash.update("DELETED");
  }
  return hash.digest("hex");
}
const json = (path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as unknown;
// Reports retained as public quality artifacts contain only fields consumed by normalizers.
export function minimize(source: string, raw: unknown): unknown {
  const r = object(raw);
  if (source === "unit" || source === "integration-adapters")
    return {
      success: r.success,
      numTotalTests: r.numTotalTests,
      numPassedTests: r.numPassedTests,
      numFailedTests: r.numFailedTests,
      numPendingTests: r.numPendingTests,
      testResults: array(r.testResults).map((value) => {
        const s = object(value);
        return {
          name: relative(process.cwd(), string(s.name)),
          status: s.status,
          assertionResults: array(s.assertionResults).map((value) => {
            const a = object(value);
            return {
              fullName: a.fullName,
              status: a.status,
              duration: a.duration,
            };
          }),
        };
      }),
    };
  if (["e2e", "e2e-prod"].includes(source)) {
    const suites = (raw: unknown): unknown[] =>
      array(raw).map((value) => {
        const s = object(value);
        return {
          suites: suites(s.suites ?? []),
          specs: array(s.specs ?? []).map((value) => {
            const p = object(value);
            return {
              id: p.id,
              title: p.title,
              tags: p.tags,
              tests: array(p.tests).map((value) => {
                const t = object(value);
                return {
                  projectName: t.projectName,
                  status: t.status,
                  results: array(t.results).map((value) => {
                    const r = object(value);
                    return {
                      status: r.status,
                      retry: r.retry,
                      duration: r.duration,
                      attachments: array(r.attachments ?? [])
                        .map(object)
                        .filter((a) => a.name === "acticiv-axe")
                        .map((a) => ({ name: a.name, body: a.body })),
                    };
                  }),
                };
              }),
            };
          }),
        };
      });
    return {
      errors: array(r.errors).map(() => ({
        error: "runner error; see restricted local logs",
      })),
      stats: r.stats,
      suites: suites(r.suites),
    };
  }
  if (source === "dependency-audit")
    return { metadata: r.metadata, ...(r.error ? { error: true } : {}) };
  if (source === "coverage")
    return Object.fromEntries(
      Object.entries(r).map(([k, v]) => [
        k === "total" ? k : relative(process.cwd(), k),
        v,
      ]),
    );
  return raw;
}
function bundles() {
  const result: Record<string, unknown> = {};
  for (const app of ["citizen", "pro"]) {
    let js = 0,
      gzip = 0,
      files = 0;
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name.endsWith(".js")) {
          const data = readFileSync(path);
          js += data.length;
          gzip += gzipSync(data, { level: 9 }).length;
          files++;
        }
      }
    }
    walk(`apps/${app}/.next/static`);
    result[app] = {
      js_bytes: js,
      gzip_bytes: gzip,
      gzip_level: 9,
      files,
      build_id: readFileSync(`apps/${app}/.next/BUILD_ID`, "utf8").trim(),
    };
  }
  return result;
}
export function collect(rebuild = false) {
  const runId =
    new Date().toISOString().replace(/[:.]/g, "-") +
    "-" +
    randomUUID().slice(0, 8);
  const directory = resolve(".quality/work", runId);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  mkdirSync(join(directory, "reports"));
  mkdirSync(join(directory, "private"), { mode: 0o700 });
  const version = (args: string[]) =>
    execFileSync("pnpm", args, { encoding: "utf8" }).trim();
  const who: Identity = {
    schema_version: 1,
    project: "ActiCiv",
    commit_sha: git("rev-parse", "HEAD"),
    branch: git("branch", "--show-current") || "detached",
    environment: process.env.CI ? "ci-local" : "local",
    created_at: new Date().toISOString(),
    producer: "acticiv-quality/1",
    run_id: runId,
    source_digest: sourceDigest(),
    dirty: Boolean(git("status", "--porcelain")),
    versions: {
      node: process.version,
      pnpm: version(["--version"]),
      vitest: version(["exec", "vitest", "--version"]),
      playwright: version(["exec", "playwright", "--version"]),
      supabase: version(["exec", "supabase", "--version"]),
    },
  };
  const inputs: Evidence[] = [];
  let completed = false;
  const manifest = () =>
    writeFileSync(
      join(directory, "manifest.json"),
      JSON.stringify({ identity: who, completed, evidence: inputs }, null, 2) +
        "\n",
      { mode: 0o600 },
    );
  manifest();
  const record = (
    source: string,
    report: unknown,
    exit: number,
    duration: number,
  ) => {
    const path = "reports/" + source + ".json";
    const bytes = JSON.stringify(report, null, 2) + "\n";
    writeFileSync(join(directory, path), bytes, { flag: "wx", mode: 0o600 });
    inputs.push({
      identity: who,
      source,
      exit_code: exit,
      duration_ms: duration,
      report,
      reference: {
        path,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      },
    });
    manifest();
    process.stdout.write(`${source}: exit ${exit}\n`);
  };
  const run = (
    source: string,
    command: string,
    args: string[],
    native?: string,
    env: Record<string, string> = {},
  ) => {
    process.stdout.write(`Collecting ${source}…\n`);
    const start = Date.now();
    const result = spawnSync(command, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: "1", ...env },
    });
    const exit = result.status ?? 1;
    writeFileSync(
      join(directory, "private", source + ".log"),
      (result.stdout ?? "") + (result.stderr ?? ""),
      { flag: "wx", mode: 0o600 },
    );
    let report: unknown = {
      complete: result.status !== null,
      tool_status: "completed",
      passed: exit === 0,
    };
    if (native) {
      try {
        report = minimize(source, json(native));
      } catch {
        report = { invalid: true };
      }
    }
    if (source === "bundles" && exit === 0)
      report = { ...object(report), metrics: bundles() };
    record(source, report, exit, Date.now() - start);
    return exit;
  };
  if (rebuild) run("db-reset", "node", ["scripts/reconstruct-db.mjs"]);
  for (const [id, args] of [
    ["format", ["format:check"]],
    ["lint", ["lint"]],
    ["typecheck", ["typecheck"]],
  ] as const)
    run(id, "pnpm", [...args]);
  const unit = join(directory, "private/unit.json"),
    coverage = join(directory, "private/coverage");
  run(
    "unit",
    "pnpm",
    [
      "exec",
      "vitest",
      "run",
      "--coverage",
      "--reporter=default",
      "--reporter=json",
      "--outputFile=" + unit,
    ],
    unit,
    { ACTICIV_COVERAGE_DIR: coverage },
  );
  try {
    record(
      "coverage",
      minimize("coverage", json(join(coverage, "coverage-summary.json"))),
      0,
      0,
    );
  } catch {
    record("coverage", { invalid: true }, 1, 0);
  }
  // Retain the complete machine metrics and LCOV separately, with relative paths only.
  for (const name of ["coverage-final.json", "lcov.info"]) {
    const p = join(coverage, name);
    if (existsSync(p))
      writeFileSync(
        join(directory, "reports", name),
        readFileSync(p, "utf8")
          .split(process.cwd() + "/")
          .join(""),
        { flag: "wx", mode: 0o600 },
      );
  }
  const sqlStart = Date.now();
  try {
    const result = sqlReport();
    record(
      "sql",
      { suites: result.suites },
      result.passed ? 0 : 1,
      Date.now() - sqlStart,
    );
  } catch {
    record("sql", { invalid: true }, 1, Date.now() - sqlStart);
  }
  const node = join(directory, "private/node.json");
  run(
    "integration-node",
    "node",
    [
      "--test",
      "--test-concurrency=1",
      "--test-reporter=spec",
      "--test-reporter-destination=stdout",
      "--test-reporter=./tooling/quality/node-reporter.mjs",
      "--test-reporter-destination=" + node,
      ...readdirSync("integration")
        .filter((f) => f.endsWith(".test.mjs"))
        .map((f) => "integration/" + f),
    ],
    node,
  );
  const adapters = join(directory, "private/adapters.json");
  run(
    "integration-adapters",
    "pnpm",
    [
      "exec",
      "vitest",
      "run",
      "--config",
      "vitest.integration.config.ts",
      "--reporter=default",
      "--reporter=json",
      "--outputFile=" + adapters,
    ],
    adapters,
  );
  run("build-citizen", "pnpm", ["--filter", "@acticiv/citizen", "build"]);
  run("build-pro", "pnpm", ["--filter", "@acticiv/pro", "build"]);
  run("bundles", "pnpm", ["verify:bundles"]);
  const pw = join(directory, "private/playwright.json");
  run("e2e", "pnpm", ["test:e2e"], pw, { ACTICIV_PLAYWRIGHT_JSON: pw });
  const prod = join(directory, "private/playwright-prod.json");
  run("e2e-prod", "pnpm", ["test:e2e:prod"], prod, {
    ACTICIV_PLAYWRIGHT_JSON: prod,
  });
  for (const source of ["sast", "artifact", "performance"]) {
    const native = join(directory, "private", source + ".json");
    run(
      source,
      "node",
      ["tooling/quality/assurance-cli.ts", source, "--output", native],
      native,
    );
  }
  if (process.env.ACTICIV_RUN_DAST === "1") {
    const native = join(directory, "private/dast.json");
    run(
      "dast",
      "node",
      ["tooling/quality/assurance-cli.ts", "dast", "--output", native],
      native,
    );
  }
  const audit = join(directory, "private/audit.json");
  const a = spawnSync("pnpm", ["audit", "--audit-level", "high", "--json"], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  writeFileSync(audit, a.stdout ?? "", { mode: 0o600 });
  try {
    record(
      "dependency-audit",
      minimize("dependency-audit", json(audit)),
      a.status ?? 1,
      0,
    );
  } catch {
    record("dependency-audit", { invalid: true }, a.status ?? 1, 0);
  }
  const secret = join(directory, "private/secrets.json");
  run("secret-scan", "pnpm", ["secrets:check"], secret, {
    ACTICIV_SECRET_REPORT: secret,
    ACTICIV_SCAN_ARTIFACTS: "1",
  });
  const stable =
    git("rev-parse", "HEAD") === who.commit_sha &&
    sourceDigest() === who.source_digest;
  record(
    "source-integrity",
    { complete: true, tool_status: "completed", passed: stable },
    stable ? 0 : 1,
    0,
  );
  completed = true;
  manifest();
  return directory;
}
export function loadEvidence(directory: string) {
  const m = object(json(join(directory, "manifest.json")));
  const evidence = array(m.evidence).map((value) => {
    const e = object(value),
      ref = object(e.reference),
      path = string(ref.path);
    if (!/^reports\/[a-z0-9-]+\.json$/.test(path))
      throw Error("Unsafe report path");
    const data = readFileSync(join(directory, path));
    if (
      createHash("sha256").update(data).digest("hex") !== ref.sha256 ||
      digest(JSON.parse(data.toString())) !== digest(e.report)
    )
      throw Error("Evidence digest mismatch");
    return e;
  });
  if (m.completed !== true) {
    // A partial collection remains representable, never quietly finalized green.
    const index = evidence.findIndex((e) => e.source === "source-integrity");
    if (index >= 0) evidence.splice(index, 1);
  }
  return { identity: m.identity, evidence };
}
