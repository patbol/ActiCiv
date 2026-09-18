import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";
import {
  validateKnowledge,
  validateSkills,
  localLinks,
  adrPaths,
  traceability,
} from "./knowledge.ts";

const files = new Map(
  execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter((p) => p && existsSync(p))
    .map((p) => [p, p.endsWith(".md") ? readFileSync(p, "utf8") : ""]),
);
const output = "docs/kb/traceability.md";
const previous = files.get(output);
// Resolve links to the generated view even on first generation/deleted output.
files.set(output, traceability([], files));
const kbPaths = [...files.keys()].filter(
  (p) =>
    /^docs\/kb\/(?:business|technical|templates)\/.+\.md$/.test(p) &&
    !p.endsWith("README.md"),
);
const kb = validateKnowledge(files, kbPaths);
const errors = [...kb.errors, ...validateSkills(files)];
const activeMarkdown = [...files.keys()].filter(
  (p) =>
    p.endsWith(".md") &&
    (p.startsWith("docs/") || ["README.md", "AGENTS.md"].includes(p)) &&
    !/^docs\/(?:evidence\/|references\/historical\/)/.test(p) &&
    !/^docs\/quality\/phase-2bis-[a-f]-/.test(p),
);
for (const path of activeMarkdown)
  errors.push(...localLinks(path, files.get(path)!, files));
for (const [id, path] of adrPaths(files)) {
  if (!/statut\s*:/i.test(files.get(path)!))
    errors.push(`${id}: status missing`);
  if (!kb.documents.some((d) => d.related_adrs.includes(id)))
    errors.push(`${id}: no KB association`);
}
const generated = await format(traceability(kb.documents, files), {
  parser: "markdown",
  proseWrap: "preserve",
});
if (process.argv.includes("--write") && !errors.length)
  writeFileSync(output, generated);
else if (previous !== generated)
  errors.push(
    "traceability stale; run pnpm docs:generate after fixing metadata",
  );
const unique = [...new Set(errors)].sort();
const report = {
  complete: true,
  tool_status: "completed",
  passed: unique.length === 0,
  metrics: {
    kb: kb.documents.length,
    adrs: adrPaths(files).size,
    skills: 15,
    checked_markdown: activeMarkdown.length,
    errors: unique.length,
  },
};
const index = process.argv.indexOf("--output");
if (index >= 0)
  writeFileSync(
    process.argv[index + 1]!,
    JSON.stringify(report, null, 2) + "\n",
    { mode: 0o600 },
  );
for (const error of unique) process.stderr.write(error + "\n");
process.stdout.write(JSON.stringify(report) + "\n");
if (unique.length) process.exitCode = 1;
