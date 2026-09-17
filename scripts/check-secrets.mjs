import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
// Official release checksums: https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1
const version = "8.30.1";
const checksums = {
  darwin_arm64:
    "b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5",
  darwin_x64:
    "dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709",
  linux_arm64:
    "e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080",
  linux_x64: "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb",
};
const target = `${process.platform}_${process.arch}`;
if (!checksums[target])
  throw new Error(`Unsupported secret scanner platform: ${target}`);
const filename = `gitleaks_${version}_${target}.tar.gz`;
const archive = join(tmpdir(), `acticiv-${filename}`);
const digest = () =>
  createHash("sha256").update(readFileSync(archive)).digest("hex");
if (!existsSync(archive) || digest() !== checksums[target]) {
  execFileSync(
    "curl",
    [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      `https://github.com/gitleaks/gitleaks/releases/download/v${version}/${filename}`,
      "--output",
      archive,
    ],
    { stdio: "inherit" },
  );
}
if (digest() !== checksums[target])
  throw new Error("Gitleaks checksum mismatch");
const directory = mkdtempSync(join(tmpdir(), "acticiv-gitleaks-"));
try {
  execFileSync("tar", ["-xzf", archive, "-C", directory, "gitleaks"]);
  const executable = join(directory, "gitleaks");
  console.log(`Gitleaks ${version}, archive SHA-256 ${checksums[target]}`);
  // A synthetic, nonfunctional credential proves the detector fails closed.
  const synthetic =
    'github_token = "' +
    ["ghp", "Aa1Bb2Cc3Dd4Ee5Ff6Gg7Hh8Ii9Jj0Kk1Ll2"].join("_") +
    '"';
  const detected = spawnSync(executable, ["stdin", "--redact", "--no-banner"], {
    input: synthetic,
    encoding: "utf8",
  });
  if (detected.status !== 1)
    throw new Error(
      `Secret scanner positive control failed: status=${detected.status}; error=${detected.error?.message ?? detected.stderr}`,
    );
  const benign = spawnSync(executable, ["stdin", "--redact", "--no-banner"], {
    input: "project_name = ActiCiv",
    encoding: "utf8",
  });
  if (benign.status !== 0)
    throw new Error("Secret scanner negative control failed");
  console.log(
    "Detector positive/negative controls passed (credential values withheld).",
  );
  const result = spawnSync(
    executable,
    [
      "git",
      "--redact",
      "--no-banner",
      "--log-opts=HEAD",
      "--report-format=json",
      "--report-path=" + join(directory, "history.json"),
      ".",
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0)
    throw new Error(
      "Secret scan failed; inspect redacted findings before publication",
    );
  // Scan the exact source candidate too: git history alone misses uncommitted work.
  const candidateDir = join(directory, "candidate");
  mkdirSync(candidateDir);
  const files = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
  for (const file of files) {
    if (!existsSync(file)) continue;
    const target = join(candidateDir, file);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(file, target);
  }
  const candidateResult = spawnSync(
    executable,
    [
      "dir",
      candidateDir,
      "--redact",
      "--no-banner",
      "--config",
      join(process.cwd(), ".gitleaks.toml"),
      "--report-format=json",
      "--report-path=" + join(directory, "candidate.json"),
    ],
    { stdio: "inherit" },
  );
  if (process.env.ACTICIV_SECRET_REPORT) {
    const findings = ["history", "candidate"].flatMap((scope) => {
      const path = join(directory, scope + ".json");
      return existsSync(path)
        ? JSON.parse(readFileSync(path, "utf8")).map((f) => ({
            scope,
            rule: f.RuleID,
            line: f.StartLine,
          }))
        : [];
    });
    writeFileSync(
      process.env.ACTICIV_SECRET_REPORT,
      JSON.stringify({
        complete: result.status === 0 && candidateResult.status === 0,
        tool_status: "completed",
        passed: result.status === 0 && candidateResult.status === 0,
        metrics: {
          version,
          findings,
          scopes: ["HEAD history", "source candidate"],
        },
      }),
    );
  }
  if (candidateResult.status !== 0)
    throw new Error("Candidate secret scan failed; findings redacted");
  console.log(
    `SECRET_SCAN_SHA=${execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()}`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
