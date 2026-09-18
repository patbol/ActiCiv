import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  copyFileSync,
  unlinkSync,
  chmodSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { latency, localServer } from "./local-server.ts";
import { inspectArtifact } from "./artifact.ts";
import { measure, files, performanceDelta } from "./performance.ts";
import { normalizeSemgrep, normalizeZap, securityGate } from "./security.ts";
import { readSnapshot } from "./storage.ts";
import { compare } from "./snapshot.ts";
const tools = JSON.parse(readFileSync("tooling/security/tools.json", "utf8"));
const [kind, ...args] = process.argv.slice(2);
const outIndex = args.indexOf("--output");
const output = outIndex < 0 ? null : args[outIndex + 1];
const root = resolve(".quality/assurance");
mkdirSync(root, { recursive: true, mode: 0o700 });
const run = mkdtempSync(join(root, kind + "-"));
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
function docker(argv: string[]) {
  const r = spawnSync("docker", ["run", "--rm", ...argv], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout: 600_000,
  });
  writeFileSync(join(run, "private.log"), (r.stdout ?? "") + (r.stderr ?? ""), {
    mode: 0o600,
  });
  return r;
}
async function main() {
  if (kind === "compare") {
    const current = readSnapshot(args[0]!);
    const base = args[1];
    const result = compare(
      current,
      base
        ? {
            snapshot: readSnapshot(base),
            baseline: read(join(dirname(base), "baseline-accepted.json")),
          }
        : null,
    );
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  let report: Record<string, unknown>;
  if (kind === "sast") {
    const code = join(run, "code");
    mkdirSync(code);
    let sourceFiles = 0;
    for (const top of [
      "apps/citizen/src",
      "apps/pro/src",
      "packages/backend/src",
      "packages/shared/src",
      "packages/ui/src",
      "packages/types/src",
    ]) {
      for (const p of files(top).filter(
        (p) => /\.(?:ts|tsx)$/.test(p) && !p.endsWith(".test.ts"),
      )) {
        const dest = join(code, p);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(p, dest);
        sourceFiles++;
      }
    }
    copyFileSync("tooling/security/semgrep.yml", join(code, "semgrep.yml"));
    const controls = read("tooling/security/controls.json") as Record<
      string,
      string
    >;
    const probe = join(code, "positive-control.ts");
    writeFileSync(probe, Object.values(controls).join("\n"));
    const positive = docker([
      "--network",
      "none",
      "-v",
      `${code}:/src:ro`,
      "-w",
      "/src",
      tools.semgrep.image,
      "semgrep",
      "scan",
      "--config",
      "semgrep.yml",
      "--json",
      "--metrics=off",
      "--disable-version-check",
      "--disable-nosem",
      "--strict",
      "positive-control.ts",
    ]);
    if (positive.status !== 0) throw Error("SAST control execution failed");
    const detected = normalizeSemgrep(JSON.parse(positive.stdout));
    if (
      !Object.keys(controls).every((id) =>
        detected.findings.some((f) => f.category.endsWith(id)),
      )
    )
      throw Error("SAST positive controls failed");
    unlinkSync(probe);
    const r = docker([
      "--network",
      "none",
      "-v",
      `${code}:/src:ro`,
      "-w",
      "/src",
      tools.semgrep.image,
      "semgrep",
      "scan",
      "--config",
      "semgrep.yml",
      "--json",
      "--metrics=off",
      "--disable-version-check",
      "--disable-nosem",
      "--strict",
      "--jobs=2",
      ".",
    ]);
    if (r.status !== 0) throw Error("SAST tool failure");
    report = {
      ...normalizeSemgrep(JSON.parse(r.stdout)),
      source_files: sourceFiles,
      positive_controls: Object.keys(controls),
      image: tools.semgrep.image,
    };
    if (report.scanned_files !== sourceFiles)
      throw Error("SAST did not scan all intended source files");
  } else if (kind === "artifact") {
    const artifacts = ["citizen", "pro"].map(inspectArtifact);
    report = {
      complete: true,
      tool: "artifact",
      artifacts,
      findings: artifacts.flatMap((a) => a.findings),
    };
  } else if (kind === "performance") {
    report = {
      complete: true,
      tool: "performance",
      findings: [],
      apps: { citizen: measure("citizen"), pro: measure("pro") },
      comparison: performanceDelta({}, null),
      latency: {
        citizen: await latency("citizen", 3200),
        pro: await latency("pro", 3201),
      },
      db_queries: {
        status: "DEFERRED",
        reason:
          "No per-request DB instrumentation in E; no invented N+1 measurement",
      },
    };
  } else if (kind === "dast") {
    const reports: ReturnType<typeof normalizeZap>[] = [];
    for (const [app, port] of [
      ["citizen", 3100],
      ["pro", 3101],
    ] as const) {
      await localServer(app, port, "demo", async () => {
        const dir = join(run, app);
        mkdirSync(dir, { mode: 0o700 });
        chmodSync(dir, 0o777); // Disposable report mount writable by the image zap user.
        const linux = process.platform === "linux";
        const target = `http://${linux ? "127.0.0.1" : "host.docker.internal"}:${port}`;
        const r = docker([
          ...(linux ? ["--network", "host"] : []),
          "-v",
          `${dir}:/zap/wrk:rw`,
          tools.zap.image,
          "zap-baseline.py",
          "-t",
          target,
          "-m",
          "1",
          "-T",
          "3",
          "-J",
          "raw.json",
          "-I",
        ]);
        if (r.status !== 0 && r.status !== 2) throw Error("DAST tool failure");
        reports.push(normalizeZap(read(join(dir, "raw.json"))));
      });
    }
    report = {
      complete: true,
      tool: "zap",
      version: tools.zap.version,
      image: tools.zap.image,
      scope: "local-demo-passive-unauthenticated",
      findings: reports.flatMap((r) => r.findings),
    };
  } else throw Error("Unknown assurance command");
  const evaluated_at = new Date().toISOString();
  const accepted_risks = read("tooling/security/accepted-risks.json");
  const gate = securityGate(
    report.findings as unknown[],
    accepted_risks,
    evaluated_at,
    kind === "dast" ? "local-demo" : "prod",
  );
  const final = {
    ...report,
    accepted_risks,
    evaluated_at,
    status: gate.status,
  };
  const p = output ?? join(run, "report.json");
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(final, null, 2) + "\n", { mode: 0o600 });
  process.stdout.write(`${kind}: ${gate.status}; report: ${p}\n`);
  if (gate.status !== "PASS") process.exitCode = 1;
}
main().catch(() => {
  process.stderr.write(
    `Assurance ${kind} failed; no PASS claimed. Restricted diagnostics: ${run}\n`,
  );
  process.exitCode = 1;
});
