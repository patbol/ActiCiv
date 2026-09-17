import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { assemble, evaluate, candidate, compare, policy } from "./snapshot.ts";
import { readSnapshot, finalize } from "./storage.ts";
import {
  collect,
  loadEvidence,
  minimize,
  git,
  sourceDigest,
} from "./collect.ts";
import { normalizePlaywright } from "./parsers.ts";
import { repetitions } from "./flakiness.ts";
import type { Snapshot, Test } from "./model.ts";
const read = (path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as unknown;
const p = policy(read("tooling/quality/policy.json"));
function report(s: Snapshot) {
  return (
    [
      "# ActiCiv — quality evidence",
      `Run: ${s.identity.run_id}`,
      `SHA: ${s.identity.commit_sha}`,
      `Environment: ${s.identity.environment}; dirty: ${s.identity.dirty}; source digest: ${s.identity.source_digest}`,
      `Gate policy: ${s.gate_evaluation.policy_version} (advisory)`,
      `Verdict: ${s.gate_evaluation.status}`,
      "",
      ...s.gate_evaluation.results.map(
        (r) => `- ${r.rule_id}: ${r.status} — ${r.reason}`,
      ),
      "",
      "## Coverage (unit V8; SQL/E2E measured separately)",
      ...Object.entries(s.coverage?.modules ?? {}).map(
        ([k, m]) =>
          `- ${k}: S ${m.statements.pct ?? "N/A"}%, B ${m.branches.pct ?? "N/A"}%, F ${m.functions.pct ?? "N/A"}%, L ${m.lines.pct ?? "N/A"}%`,
      ),
    ].join("\n") + "\n"
  );
}
function snapshot(directory: string) {
  const input = loadEvidence(directory);
  const s = assemble(input.identity, input.evidence, p);
  s.manual_evidence = [
    {
      tool: "VoiceOver",
      status: "PASS",
      reference: "docs/quality/phase-2bis-c-voiceover.md",
      scope:
        "Historical C-VO-01…05 confirmed by Patrick; historical scope only; current applicability requires review, not a new reader run",
    },
    {
      tool: "TalkBack",
      status: "DEFERRED",
      reference: "docs/quality/phase-2bis-c-voiceover.md",
      scope: "No connected Android; no inferred PASS",
    },
  ];
  const path = finalize(".quality/snapshots", s);
  cpSync(join(directory, "reports"), join(dirname(path), "reports"), {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  writeFileSync(
    join(dirname(path), "baseline-candidate.json"),
    JSON.stringify(candidate(s), null, 2) + "\n",
    { flag: "wx", mode: 0o600 },
  );
  writeFileSync(join(dirname(path), "report.md"), report(s), {
    flag: "wx",
    mode: 0o600,
  });
  process.stdout.write(report(s) + "\nSnapshot: " + path + "\n");
  if (s.gate_evaluation.status !== "PASS") process.exitCode = 1;
  return path;
}
async function main() {
  const [command, arg, ...rest] = process.argv.slice(2);
  if (command === "collect") {
    const dir = collect(arg === "--rebuild-db");
    process.stdout.write("Collected: " + dir + "\n");
    snapshot(dir);
  } else if (command === "snapshot") {
    if (!arg) throw Error("Provide collection directory");
    snapshot(arg);
  } else if (command === "evaluate") {
    if (!arg) throw Error("Provide snapshot.json");
    const s = readSnapshot(arg);
    const result = evaluate(s, p);
    if (result.policy_digest !== s.gate_evaluation.policy_digest)
      throw Error("Changed policy requires a new snapshot");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    if (result.status !== "PASS") process.exitCode = 1;
  } else if (command === "report") {
    if (!arg) throw Error("Provide snapshot.json");
    process.stdout.write(report(readSnapshot(arg)));
  } else if (command === "compare") {
    if (!arg) throw Error("Provide current snapshot");
    const current = readSnapshot(arg);
    const baselinePath = rest[0];
    const result = compare(
      current,
      baselinePath
        ? {
            baseline: read(
              join(dirname(baselinePath), "baseline-accepted.json"),
            ),
            snapshot: readSnapshot(baselinePath),
          }
        : null,
    );
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else if (command === "flakiness") {
    const count = Number(arg ?? 3);
    if (!Number.isInteger(count) || count < 2 || count > 20)
      throw Error("Repeat count must be 2..20");
    const runId = "flakiness-" + randomUUID();
    const dir = resolve(".quality/flakiness", runId);
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const runs: Test[][] = [];
    const outcomes: { exit_code: number; status: string }[] = [];
    const commit_sha = git("rev-parse", "HEAD"),
      source_digest = sourceDigest();
    const first = new Date().toISOString();
    for (let n = 0; n < count; n++) {
      const native = join(dir, `private-${n}.json`);
      const result = spawnSync(
        "pnpm",
        ["exec", "playwright", "test", "--grep", "@critical"],
        {
          env: { ...process.env, ACTICIV_PLAYWRIGHT_JSON: native },
          stdio: "inherit",
        },
      );
      if (!existsSync(native)) throw Error("Flakiness run missing report");
      const report = minimize("e2e", read(native));
      const normalized = normalizePlaywright(report);
      runs.push(normalized.tests);
      outcomes.push({
        exit_code: result.status ?? 1,
        status: normalized.status,
      });
      writeFileSync(
        join(dir, `attempt-${n}.json`),
        JSON.stringify({ exit_code: result.status, report }, null, 2),
        { flag: "wx", mode: 0o600 },
      );
    }
    const summary = {
      schema_version: 1,
      run_id: runId,
      commit_sha,
      source_digest,
      environment: process.env.CI ? "ci-local" : "local",
      outcomes,
      source_unchanged:
        git("rev-parse", "HEAD") === commit_sha &&
        sourceDigest() === source_digest,
      first_observed: first,
      last_observed: new Date().toISOString(),
      ...repetitions(runs),
    };
    writeFileSync(
      join(dir, "flakiness.json"),
      JSON.stringify(summary, null, 2) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    process.stdout.write("Flakiness: " + join(dir, "flakiness.json") + "\n");
    if (
      !summary.source_unchanged ||
      outcomes.some((o) => o.exit_code !== 0 || o.status !== "PASS")
    )
      process.exitCode = 1;
  } else
    throw Error(
      "Use collect, snapshot, evaluate, report, compare or flakiness",
    );
}
main().catch(() => {
  process.stderr.write(
    "Quality command failed; no PASS claimed. Inspect the local restricted evidence and command arguments.\n",
  );
  process.exitCode = 1;
});
