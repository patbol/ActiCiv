import { promises as fs } from "node:fs";
import { join, resolve, relative, isAbsolute } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { validateSnapshot, digest, compare } from "@acticiv/quality/snapshot";
import type { Snapshot } from "@acticiv/quality/model";
import type { QualityQuery } from "../application/read";
const runPattern = /^\w[\w.-]{0,120}$/;
const maxBytes = 8_000_000;
export type Baseline = {
  status: "NONE" | "CANDIDATE" | "ACCEPTED" | "INVALID";
  record?: Record<string, unknown>;
};
export type Run =
  | {
      state: "valid";
      id: string;
      snapshot: Snapshot;
      digest: string;
      baseline: Baseline;
      artifact: Artifact | null;
    }
  | { state: "invalid"; id: string };
export type Artifact = {
  url: string;
  expires_at: string | null;
  expired: boolean;
};
async function bounded(root: string, path: string) {
  const full = resolve(root, path),
    realRoot = await fs.realpath(root);
  const rel = relative(resolve(root), full);
  if (isAbsolute(rel) || rel.startsWith("..")) throw Error("Unsafe path");
  // Every component must stay within the root; reject symbolic references.
  let cursor = resolve(root);
  for (const part of rel.split("/")) {
    cursor = join(cursor, part);
    if ((await fs.lstat(cursor)).isSymbolicLink()) throw Error("Unsafe link");
  }
  const real = await fs.realpath(full);
  if (!real.startsWith(realRoot + "/")) throw Error("Unsafe path");
  const stat = await fs.stat(full);
  if (!stat.isFile() || stat.size > maxBytes)
    throw Error("Invalid evidence size");
  return fs.readFile(full);
}
async function optional(root: string, path: string): Promise<unknown> {
  try {
    return JSON.parse((await bounded(root, path)).toString());
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Invalid metadata");
  return value as Record<string, unknown>;
}
export function controlledArtifact(
  raw: unknown,
  now = Date.now(),
): Artifact | null {
  if (raw === null) return null;
  const r = record(raw);
  if (
    typeof r.url !== "string" ||
    !/^https:\/\/github\.com\/patbol\/ActiCiv\/actions\/runs\/\d+(?:\/artifacts\/\d+)?$/.test(
      r.url,
    )
  )
    throw Error("Invalid artifact URL");
  if (
    r.expires_at !== null &&
    (typeof r.expires_at !== "string" ||
      !Number.isFinite(Date.parse(r.expires_at)))
  )
    throw Error("Invalid expiry");
  const expires_at = r.expires_at as string | null;
  return {
    url: r.url,
    expires_at,
    expired: expires_at !== null && Date.parse(expires_at) <= now,
  };
}
async function bundle(root: string) {
  const raw = JSON.parse((await bounded(root, "snapshot.json")).toString());
  const snapshot = validateSnapshot(raw),
    hash = digest(raw);
  if (hash !== (await bounded(root, "snapshot.sha256")).toString().trim())
    throw Error("Invalid snapshot digest");
  const references = [
    ...Object.values(snapshot.provenance),
    ...snapshot.gate_evaluation.results.flatMap((g) =>
      g.evidence ? [g.evidence] : [],
    ),
  ];
  for (const ref of references) {
    const bytes = await bounded(root, ref.path);
    if (createHash("sha256").update(bytes).digest("hex") !== ref.sha256)
      throw Error("Invalid evidence digest");
  }
  const accepted = await optional(root, "baseline-accepted.json"),
    candidate = await optional(root, "baseline-candidate.json");
  let baseline: Baseline = { status: "NONE" };
  const meta = accepted ?? candidate;
  if (meta !== null) {
    const b = record(meta);
    if (
      b.run_id !== snapshot.identity.run_id ||
      b.commit_sha !== snapshot.identity.commit_sha ||
      b.environment !== snapshot.identity.environment ||
      b.snapshot_digest !== hash ||
      b.policy_digest !== snapshot.gate_evaluation.policy_digest
    )
      throw Error("Invalid baseline reference");
    if (accepted !== null) {
      compare(snapshot, { baseline: b, snapshot });
      baseline = { status: "ACCEPTED", record: b };
    } else if (b.status === "CANDIDATE") baseline = { status: "CANDIDATE" };
    else throw Error("Invalid candidate");
  }
  return {
    snapshot,
    hash,
    raw,
    baseline,
    artifact: controlledArtifact(await optional(root, "artifact-link.json")),
  };
}
export async function importRun(
  source: string,
  target: string,
  artifact?: { url: string; expires_at: string | null },
) {
  const b = await bundle(source);
  const id = b.snapshot.identity.run_id;
  await fs.mkdir(target, { recursive: true, mode: 0o700 });
  const dest = join(target, id),
    stage = join(target, ".import-" + randomUUID());
  // Exclusive reservation: repeated ingestion never overwrites evidence.
  await fs.mkdir(dest, { mode: 0o700 });
  try {
    await fs.mkdir(stage, { mode: 0o700 });
    const paths = new Set([
      "snapshot.json",
      "snapshot.sha256",
      ...Object.values(b.snapshot.provenance).map((r) => r.path),
      ...b.snapshot.gate_evaluation.results.flatMap((g) =>
        g.evidence ? [g.evidence.path] : [],
      ),
    ]);
    for (const path of [
      "baseline-accepted.json",
      "baseline-candidate.json",
      "artifact-link.json",
    ])
      if ((await optional(source, path)) !== null) paths.add(path);
    for (const path of paths) {
      const bytes = await bounded(source, path);
      await fs.mkdir(resolve(stage, path, ".."), {
        recursive: true,
        mode: 0o700,
      });
      await fs.writeFile(join(stage, path), bytes, { flag: "wx", mode: 0o600 });
    }
    if (artifact) {
      const validated = controlledArtifact(artifact);
      await fs.writeFile(
        join(stage, "artifact-link.json"),
        JSON.stringify({
          url: validated!.url,
          expires_at: validated!.expires_at,
        }),
        { mode: 0o600 },
      );
    }
    await bundle(stage);
    await fs.rename(stage, dest);
  } catch (e) {
    await fs.rm(stage, { recursive: true, force: true });
    await fs.rm(dest, { recursive: true, force: true });
    throw e;
  }
  return id;
}
export async function readRun(root: string, id: string): Promise<Run> {
  try {
    if (!runPattern.test(id) || id.includes("..")) throw Error("Invalid run");
    const dir = join(root, id);
    if ((await fs.lstat(dir)).isSymbolicLink()) throw Error("Unsafe run");
    const b = await bundle(dir);
    if (b.snapshot.identity.run_id !== id) throw Error("Mismatched run");
    return {
      state: "valid",
      id,
      snapshot: b.snapshot,
      digest: b.hash,
      baseline: b.baseline,
      artifact: b.artifact,
    };
  } catch {
    return { state: "invalid", id: runPattern.test(id) ? id : "invalid" };
  }
}
export async function listRuns(root: string, query: QualityQuery) {
  let names: string[];
  try {
    names = (await fs.readdir(root))
      .filter((n) => runPattern.test(n) && !n.includes(".."))
      .sort()
      .reverse();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      return { runs: [], hasMore: false };
    throw e;
  }
  const offset = Math.max(0, Math.min(query.offset ?? 0, 10000));
  // Bounded reads and rendering; no full snapshots sent as a client payload.
  const batch = names.slice(offset, offset + 25);
  const runs: Run[] = [];
  for (const name of batch) {
    const run = await readRun(root, name);
    if (
      run.state === "invalid" ||
      ((!query.environment ||
        run.snapshot.identity.environment === query.environment) &&
        (!query.status || run.snapshot.gate_evaluation.status === query.status))
    )
      runs.push(run);
  }
  return { runs, hasMore: names.length > offset + 25 };
}
