import { importRun } from "../../packages/backend/src/modules/quality/infrastructure/files.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readSnapshot } from "./storage.ts";
import { evaluate, digest } from "./snapshot.ts";
const [source, target, artifactUrl, expiresAt] = process.argv.slice(2);
if (!source || !target)
  throw Error("Usage: quality:import <verified-run-directory> <private-store>");
const snapshot = readSnapshot(join(source, "snapshot.json"));
const policies = [
  "policy.json",
  "policy-e.json",
  "policy-f.json",
  "policy-g.json",
  "policy-i.json",
].map((n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8")));
const p = policies.find(
  (p) => p.version === snapshot.gate_evaluation.policy_version,
);
if (!p || digest(evaluate(snapshot, p)) !== digest(snapshot.gate_evaluation))
  throw Error("Unknown policy or inconsistent canonical evaluation");
process.stdout.write(
  JSON.stringify({
    imported: await importRun(
      source,
      target,
      artifactUrl
        ? { url: artifactUrl, expires_at: expiresAt ?? null }
        : undefined,
    ),
  }) + "\n",
);
