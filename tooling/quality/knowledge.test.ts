import { expect, it } from "vitest";
import {
  validateKnowledge,
  traceability,
  validateSkills,
  skillNames,
  skillSections,
} from "./knowledge.ts";

const file = "docs/kb/business/example.md";
const page = `---
id: feature.example
title: Example
domain: auth
type: business-feature
status: active
introduced_in: phase-2
roles: [client_admin]
requirements: [ADR-004]
related_adrs: [ADR-004]
related_code: [packages/backend/src/example.ts]
related_tests: [integration/example.test.mjs]
related_docs: [docs/kb/technical/audit.md]
---
# Example
See [history](../../references/historical/decision.md#decision).
`;
const fixture = () =>
  new Map([
    [file, page],
    [
      "docs/architecture-decisions/004-example.md",
      "# ADR-004\nStatut : acceptée\n",
    ],
    ["docs/references/historical/decision.md", "# Decision\n"],
    ["packages/backend/src/example.ts", "export {};"],
    ["integration/example.test.mjs", ""],
    ["docs/kb/technical/audit.md", "# Audit\n"],
  ]);
function check(change?: (files: Map<string, string>) => void) {
  const files = fixture();
  change?.(files);
  return validateKnowledge(files, [file]);
}
it("accepts a complete KB and an explicitly historical local reference", () => {
  expect(check().errors).toEqual([]);
});
it.each([
  ["id: feature.example\n", "", "id"],
  ["type: business-feature", "type: unknown", "type"],
  ["status: active", "status: approved", "status"],
  ["related_adrs: [ADR-004]", "related_adrs: [ADR-999]", "ADR"],
  ["packages/backend/src/example.ts", "packages/missing.ts", "related_code"],
  [
    "integration/example.test.mjs",
    "integration/missing.test.mjs",
    "related_tests",
  ],
  ["decision.md#decision", "missing.md", "link"],
  ["#decision", "#missing", "anchor"],
  ["introduced_in: phase-2", "introduced_in: phase-3", "phase"],
  ["feature.example", "feature.citizen-reporting", "future"],
  [
    "related_tests: [integration/example.test.mjs]",
    "related_tests: []",
    "related_tests",
  ],
  ["id: feature.example", "id: feature.example\nid: duplicate", "YAML"],
])("rejects invalid metadata/reference %#", (before, after, reason) => {
  expect(
    check((files) => files.set(file, page.replace(before, after))).errors.join(
      " ",
    ),
  ).toContain(reason);
});
it("rejects missing frontmatter and duplicate stable IDs", () => {
  expect(
    check((files) => files.set(file, "# Only a heading")).errors.join(" "),
  ).toContain("frontmatter");
  const files = fixture();
  files.set("docs/kb/business/copy.md", page);
  expect(
    validateKnowledge(files, [file, "docs/kb/business/copy.md"]).errors.join(
      " ",
    ),
  ).toContain("duplicate id");
});
it("does not treat fenced examples or remote URLs as local files", () => {
  expect(
    check((files) =>
      files.set(
        file,
        page +
          "\n```md\n[x](missing.md)\n```\n[external](https://example.test/)\n",
      ),
    ).errors,
  ).toEqual([]);
});
it("rejects repository escapes, unsafe schemes, and missing reference links", () => {
  for (const link of [
    "[x](../../../../private.md)",
    "[x](javascript:alert)",
    "[x][missing]",
  ]) {
    expect(
      check((files) => files.set(file, page + link)).errors.length,
    ).toBeGreaterThan(0);
  }
});
it("resolves reference-style links and duplicate heading anchors", () => {
  expect(
    check((files) => {
      files.set(
        file,
        page + "\n## Repeat\n## Repeat\n[x][ref]\n[ref]: #repeat-1\n",
      );
    }).errors,
  ).toEqual([]);
});
it("generates deterministic traceability with reverse ADR links and no invented coverage", () => {
  const result = check();
  const generated = traceability(result.documents, fixture());
  expect(generated).toContain("feature.example");
  expect(generated).toContain("../architecture-decisions/004-example.md");
  expect(generated).toContain("technical/audit.md");
  expect(traceability([...result.documents].reverse(), fixture())).toEqual(
    generated,
  );
  expect(traceability([], fixture())).not.toContain("feature.example");
});
it("requires all fifteen routable Skills with actual procedures and local references", () => {
  const files = new Map(
    skillNames.map((name) => [
      `docs/skills/${name}/SKILL.md`,
      `---\nname: ${name}\ndescription: A specific procedure\n---\n${skillSections.map((h) => `## ${h}\nContent.\n`).join("\n")}`,
    ]),
  );
  expect(validateSkills(files)).toEqual([]);
  files.delete("docs/skills/fix-bug/SKILL.md");
  expect(validateSkills(files).join(" ")).toContain("fix-bug");
  files.set(
    "docs/skills/fix-bug/SKILL.md",
    "---\nname: wrong\ndescription: x\n---\n[broken](missing.md)",
  );
  expect(validateSkills(files).join(" ")).toContain("invalid skill metadata");
  expect(validateSkills(files).join(" ")).toContain("missing section");
  expect(validateSkills(files).join(" ")).toContain("broken local link");
});
it("authorizes H Quality Center documentation without allowing I or Phase 3", () => {
  const text = page
    .replace("feature.example", "feature.quality-center")
    .replace("introduced_in: phase-2", "introduced_in: phase-2bis-h");
  expect(check((files) => files.set(file, text)).errors).toEqual([]);
  expect(
    check((files) =>
      files.set(file, text.replace("phase-2bis-h", "phase-2bis-i")),
    ).errors.join(),
  ).toContain("phase");
});
