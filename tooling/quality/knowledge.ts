import { posix } from "node:path";
import { parseDocument } from "yaml";

export type Knowledge = {
  path: string;
  id: string;
  title: string;
  domain: string;
  type: string;
  status: string;
  introduced_in: string;
  roles: string[];
  requirements: string[];
  related_adrs: string[];
  related_code: string[];
  related_tests: string[];
  related_docs: string[];
};
type Inventory = ReadonlyMap<string, string>;
const lists = [
  "roles",
  "requirements",
  "related_adrs",
  "related_code",
  "related_tests",
  "related_docs",
] as const;
export function frontmatter(text: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw Error("frontmatter required");
  const doc = parseDocument(match[1]!, { uniqueKeys: true });
  if (doc.errors.length) throw Error("invalid YAML");
  const value: unknown = doc.toJS({ maxAliasCount: 0 });
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("YAML mapping required");
  return value as Record<string, unknown>;
}
const body = (text: string) =>
  text
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .replace(/^(?:```|~~~)[\s\S]*?^(?:```|~~~).*$/gm, "");
const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s/g, "-");
function anchors(text: string) {
  const found = new Set<string>();
  for (const match of body(text).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = slug(match[1]!);
    let id = base,
      n = 0;
    while (found.has(id)) id = `${base}-${++n}`;
    found.add(id);
  }
  for (const m of text.matchAll(/\b(?:id|name)=["']([^"']+)["']/g))
    found.add(m[1]!);
  return found;
}
function exists(files: Inventory, target: string) {
  return (
    files.has(target) ||
    [...files.keys()].some((p) => p.startsWith(target.replace(/\/$/, "") + "/"))
  );
}
function safePath(path: string) {
  return (
    path !== ".." &&
    !path.startsWith("../") &&
    !posix.isAbsolute(path) &&
    !path.includes("\\")
  );
}
export function localLinks(
  path: string,
  text: string,
  files: Inventory,
): string[] {
  const errors: string[] = [],
    content = body(text);
  const refs = new Map(
    [...content.matchAll(/^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)].map((m) => [
      m[1]!.toLowerCase(),
      m[2]!,
    ]),
  );
  const targets = [
    ...content.matchAll(
      /!?\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)/g,
    ),
  ].map((m) => m[1] ?? m[2]!);
  for (const m of content.matchAll(/\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
    const target = refs.get((m[2] || m[1]!).toLowerCase());
    if (target) targets.push(target);
    else errors.push(`${path}: missing reference link`);
  }
  targets.push(...refs.values());
  for (const link of targets) {
    if (/^(https?:|mailto:)/i.test(link)) continue;
    if (/^[\w+.-]+:/.test(link)) {
      errors.push(`${path}: unsafe link scheme`);
      continue;
    }
    try {
      const [rawPath, hash] = link.split("#", 2);
      const target = rawPath
        ? posix.normalize(
            posix.join(
              posix.dirname(path),
              decodeURIComponent(rawPath.split("?")[0]!),
            ),
          )
        : path;
      if (!safePath(target) || !exists(files, target))
        errors.push(`${path}: broken local link ${link}`);
      else if (
        hash &&
        target.endsWith(".md") &&
        !anchors(files.get(target) ?? "").has(decodeURIComponent(hash))
      )
        errors.push(`${path}: broken anchor ${link}`);
    } catch {
      errors.push(`${path}: malformed local link`);
    }
  }
  return errors;
}
export function adrPaths(files: Inventory) {
  return new Map(
    [...files.keys()]
      .filter((p) => /^docs\/architecture-decisions\/\d{3}-[^/]+\.md$/.test(p))
      .map((p) => [`ADR-${posix.basename(p).slice(0, 3)}`, p]),
  );
}
export function validateKnowledge(files: Inventory, paths: string[]) {
  const errors: string[] = [],
    documents: Knowledge[] = [],
    ids = new Set<string>(),
    adrs = adrPaths(files);
  for (const path of paths.sort()) {
    const start = errors.length;
    let raw: Record<string, unknown>;
    try {
      raw = frontmatter(files.get(path) ?? "");
    } catch (e) {
      errors.push(
        `${path}: ${e instanceof Error ? e.message : "invalid frontmatter"}`,
      );
      continue;
    }
    for (const field of [
      "id",
      "title",
      "domain",
      "type",
      "status",
      "introduced_in",
    ])
      if (typeof raw[field] !== "string" || !String(raw[field]).trim())
        errors.push(`${path}: ${field} required`);
    if (typeof raw.id === "string") {
      if (!/^[a-z][a-z0-9.-]+$/.test(raw.id))
        errors.push(`${path}: invalid id`);
      if (ids.has(raw.id)) errors.push(`${path}: duplicate id ${raw.id}`);
      ids.add(raw.id);
    }
    const template = path.startsWith("docs/kb/templates/");
    const types = template
      ? ["business-feature-template", "technical-topic-template"]
      : ["business-feature", "technical-topic"];
    if (!types.includes(String(raw.type))) errors.push(`${path}: invalid type`);
    if (
      !(
        template
          ? ["template"]
          : ["draft", "active", "historical", "superseded"]
      ).includes(String(raw.status))
    )
      errors.push(`${path}: invalid status`);
    if (
      raw.status === "active" &&
      !/^phase-(?:1|2|2bis-[a-g])$/.test(String(raw.introduced_in))
    )
      errors.push(`${path}: unsupported active phase`);
    // Explicit scope deny-list, not a semantic claim about all possible future prose.
    if (
      raw.status === "active" &&
      /citizen-reporting|smart-queue|duplicate-management|(?:^|[./-])(?:routing|intervention|transfer|quality-center)(?:[./-]|$)/.test(
        `${raw.id}/${raw.domain}/${path}`,
      )
    )
      errors.push(`${path}: future behavior cannot be active`);
    for (const field of lists) {
      const value = raw[field];
      if (
        !Array.isArray(value) ||
        value.some((v) => typeof v !== "string" || !v.trim())
      ) {
        errors.push(`${path}: ${field} must be string list`);
        continue;
      }
      if (
        !template &&
        raw.status === "active" &&
        [
          "requirements",
          "related_code",
          "related_tests",
          "related_adrs",
        ].includes(field) &&
        !value.length
      )
        errors.push(`${path}: ${field} required for active KB`);
      if (field === "related_adrs")
        for (const id of value)
          if (!adrs.has(id)) errors.push(`${path}: unknown ADR ${id}`);
      if (["related_code", "related_tests", "related_docs"].includes(field))
        for (const p of value)
          if (!safePath(p) || !exists(files, p))
            errors.push(`${path}: missing ${field} ${p}`);
    }
    errors.push(...localLinks(path, files.get(path) ?? "", files));
    if (errors.length === start) documents.push({ ...raw, path } as Knowledge);
  }
  return { errors, documents };
}
export function traceability(documents: Knowledge[], files: Inventory) {
  const link = (p: string, label = posix.basename(p)) =>
    `[${label.replace(/\|/g, "\\|")}](${posix.relative("docs/kb", p)})`;
  const adrs = adrPaths(files),
    sorted = [...documents]
      .filter((d) => d.status !== "template")
      .sort((a, b) => a.id.localeCompare(b.id, "en"));
  return [
    "# Traçabilité générée",
    "",
    "Générée par `pnpm docs:generate` depuis le frontmatter KB. Ne pas éditer à la main. Les liens attestent une association, pas un résultat de test ni une couverture exhaustive.",
    "",
    "| KB / domaine / statut | Exigences et acteurs | ADR | Code | Tests | Documentation / observabilité |",
    "| --- | --- | --- | --- | --- | --- |",
    ...sorted.map(
      (d) =>
        `| ${link(d.path, d.id)} — ${d.domain} (${d.status}) | ${[...d.requirements, ...d.roles].join("; ").replace(/\|/g, "\\|")} | ${d.related_adrs.map((id) => link(adrs.get(id)!, id)).join("<br>")} | ${d.related_code.map((p) => link(p)).join("<br>")} | ${d.related_tests.map((p) => link(p)).join("<br>")} | ${d.related_docs.map((p) => link(p)).join("<br>")} |`,
    ),
    "",
    "## ADR → KB",
    "",
    ...[...adrs].sort().map(
      ([id, p]) =>
        `- ${link(p, id)} : ${
          sorted
            .filter((d) => d.related_adrs.includes(id))
            .map((d) => link(d.path, d.id))
            .join(", ") || "aucune association KB"
        }`,
    ),
    "",
  ].join("\n");
}

export const skillNames = [
  "implement-feature",
  "change-existing-feature",
  "fix-bug",
  "add-business-rule",
  "add-e2e-test",
  "add-rbac-rule",
  "database-migration",
  "add-analytics-event",
  "add-audit-event",
  "add-logging",
  "i18n",
  "create-adr",
  "update-kb",
  "security-review",
  "prepare-release",
];
export const skillSections = [
  "Objectif et déclencheur",
  "Préconditions et lectures",
  "Impact map",
  "Procédure",
  "Tests et preuves",
  "Documentation",
  "Sécurité et arrêt",
  "Definition of Done",
  "Erreurs à éviter",
];
export function validateSkills(files: Inventory) {
  const errors: string[] = [];
  for (const name of skillNames) {
    const path = `docs/skills/${name}/SKILL.md`,
      text = files.get(path) ?? "";
    try {
      const fm = frontmatter(text);
      if (
        fm.name !== name ||
        typeof fm.description !== "string" ||
        !fm.description.trim()
      )
        errors.push(`${path}: invalid skill metadata`);
      for (const heading of skillSections)
        if (!text.includes(`## ${heading}\n`))
          errors.push(`${path}: missing section ${heading}`);
      errors.push(...localLinks(path, text, files));
    } catch {
      errors.push(`${path}: missing/invalid Skill frontmatter`);
    }
  }
  return errors;
}
