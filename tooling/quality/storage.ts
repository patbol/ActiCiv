import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { validateSnapshot, digest } from "./snapshot.ts";
import type { Snapshot } from "./model.ts";
export function finalize(root: string, snapshot: Snapshot) {
  validateSnapshot(snapshot);
  mkdirSync(root, { recursive: true });
  const dir = join(root, snapshot.identity.run_id);
  mkdirSync(dir); // EEXIST deliberately rejects duplicate runs.
  const path = join(dir, "snapshot.json");
  writeFileSync(path, JSON.stringify(snapshot, null, 2) + "\n", {
    flag: "wx",
    mode: 0o600,
  });
  writeFileSync(join(dir, "snapshot.sha256"), digest(snapshot) + "\n", {
    flag: "wx",
    mode: 0o600,
  });
  return path;
}
export function readSnapshot(path: string) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const s = validateSnapshot(raw);
  if (
    digest(raw) !==
    readFileSync(
      path.replace(/snapshot\.json$/, "snapshot.sha256"),
      "utf8",
    ).trim()
  )
    throw Error("Snapshot integrity mismatch");
  for (const ref of Object.values(s.provenance)) {
    const actual = createHash("sha256")
      .update(readFileSync(join(dirname(path), ref.path)))
      .digest("hex");
    if (actual !== ref.sha256) throw Error("Evidence integrity mismatch");
  }
  return s;
}
