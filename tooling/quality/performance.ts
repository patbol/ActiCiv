import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
export function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
export function performanceDelta(
  current: Record<string, number>,
  baseline: Record<string, number> | null,
) {
  for (const v of [...Object.values(current), ...Object.values(baseline ?? {})])
    if (!Number.isFinite(v) || v < 0) throw Error("Invalid performance metric");
  return {
    status: baseline ? "COMPARED" : "NO_BASELINE",
    mode: "advisory",
    budget: null,
    deltas: baseline
      ? Object.fromEntries(
          [...new Set([...Object.keys(current), ...Object.keys(baseline)])].map(
            (k) => [
              k,
              current[k] === undefined || baseline[k] === undefined
                ? null
                : current[k]! - baseline[k]!,
            ],
          ),
        )
      : null,
  };
}
export function measure(app: string, dir = ".next") {
  const root = `apps/${app}/${dir}`;
  const all = files(root + "/static");
  const chunks = all
    .filter((p) => p.endsWith(".js"))
    .map((p) => ({
      path: p.slice(root.length + 1),
      bytes: statSync(p).size,
      gzip_bytes: gzipSync(readFileSync(p), { level: 9 }).length,
    }))
    .sort((a, b) => b.bytes - a.bytes);
  if (!chunks.length) throw Error("No compiled chunks");
  return {
    build_id: readFileSync(root + "/BUILD_ID", "utf8").trim(),
    target: dir === ".next-demo" ? "demo" : "prod",
    js_bytes: chunks.reduce((n, c) => n + c.bytes, 0),
    gzip_bytes: chunks.reduce((n, c) => n + c.gzip_bytes, 0),
    chunk_count: chunks.length,
    largest_chunk_bytes: chunks[0]!.bytes,
    static_asset_bytes: all.reduce((n, p) => n + statSync(p).size, 0),
    css_bytes: all
      .filter((p) => p.endsWith(".css"))
      .reduce((n, p) => n + statSync(p).size, 0),
    largest_chunks: chunks.slice(0, 5),
    gzip_level: 9,
    client_source_files: files(`apps/${app}/src`).filter(
      (p) =>
        /\.tsx?$/.test(p) &&
        /^["']use client["']/m.test(readFileSync(p, "utf8")),
    ).length,
  };
}
