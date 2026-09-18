import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";
import { FlattenMap, originalPositionFor } from "@jridgewell/trace-mapping";
import { finding, type Finding } from "./security.ts";
import { files } from "./performance.ts";
// Exact upstream source exceptions, only for diagnostic console calls. Never for app code.
const frameworkConsole: { source: string; source_sha256: string }[] =
  JSON.parse(
    readFileSync(
      new URL("../security/artifact-allowlist.json", import.meta.url),
      "utf8",
    ),
  );
export function inspectFile(path: string, source: string, map?: string) {
  const out: Finding[] = [];
  const add = (category: string, at = 0) =>
    out.push(finding("artifact", category, "high", path + ":" + at));
  if (
    /(?:^|\/)(?:fixtures|__tests__|__mocks__|test-helpers)(?:\/|\.)|\.(?:spec|test)\.[cm]?js$/.test(
      path,
    )
  )
    add("test-code");
  if (/(?:^|\/)(?:debug|__debug|dev-panel|test-login)(?:\/|\.)/.test(path))
    add("debug-route");
  if (
    path.startsWith("static/") &&
    (path.endsWith(".map") || /sourceMappingURL\s*=/.test(source))
  )
    add("public-map");
  // Server maps are restricted build diagnostics. Check sources, not embedded framework source text.
  if (path.endsWith(".map")) return out;
  const patterns: [string, RegExp][] = [
    [
      "fake-user",
      /(?:agent|supervisor|client_admin)\d*@(?:seed\.)?acticiv\.test|fake[-_]?user/i,
    ],
    [
      "bypass",
      /\b(?:MOCK_AUTH|BYPASS_AUTH|SKIP_AUTH|DISABLE_RLS|DEBUG_AUTH|MOCK_API)\b/,
    ],
    [
      "demo",
      /preview-name|preview-help|FoundationDialog|foundation-dialog|dialog-overlay/,
    ],
    [
      "test-code",
      /["'](?:@playwright\/test|vitest|msw|@testing-library\/[\w-]+)["']|(?:e2e|integration)\/(?:fixtures|helpers)\//,
    ],
    [
      "secret",
      /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|\b(?:sk_live_|ghp_|sb_secret_)[A-Za-z0-9_-]{20,}|\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    ],
  ];
  for (const [category, re] of patterns) if (re.test(source)) add(category);
  if (
    path.startsWith("static/") &&
    /SUPABASE_SERVICE_ROLE_KEY|invitationAdapters|platformAdministration|professionalClient|node:child_process/.test(
      source,
    )
  )
    add("server-client");
  if (/data-testid|data-test[=\"\']|data-cy[=\"\']/.test(source))
    add("test-hook");
  if (path.endsWith(".js")) {
    const tree = ts.createSourceFile(
      path,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    const trace = map ? new FlattenMap(JSON.parse(map)) : null;
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const expr = node.expression;
        const prop = ts.isPropertyAccessExpression(expr)
          ? expr.name.text
          : ts.isElementAccessExpression(expr) &&
              ts.isStringLiteral(expr.argumentExpression)
            ? expr.argumentExpression.text
            : null;
        const obj =
          ts.isPropertyAccessExpression(expr) ||
          ts.isElementAccessExpression(expr)
            ? expr.expression
            : null;
        if (
          obj &&
          ts.isIdentifier(obj) &&
          obj.text === "console" &&
          ["log", "debug", "trace"].includes(prop ?? "")
        ) {
          const pos = tree.getLineAndCharacterOfPosition(node.getStart(tree));
          const original = trace
            ? originalPositionFor(trace, {
                line: pos.line + 1,
                column: pos.character,
              }).source
            : null;
          const normalized = original
            ? decodeURIComponent(original).split("/node_modules/").pop()
            : null;
          const content =
            trace && original
              ? trace.sourcesContent?.[trace.resolvedSources.indexOf(original)]
              : null;
          const sourceHash =
            typeof content === "string"
              ? createHash("sha256").update(content).digest("hex")
              : null;
          if (
            !normalized ||
            !frameworkConsole.some(
              (e) => e.source === normalized && e.source_sha256 === sourceHash,
            )
          )
            add("console", node.getStart(tree));
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  return out;
}
export function inspectArtifact(app: string) {
  const root = `apps/${app}/.next`;
  if (!existsSync(root + "/BUILD_ID")) throw Error("Production build absent");
  const config = JSON.parse(
    readFileSync(root + "/required-server-files.json", "utf8"),
  ).config;
  if (
    config.distDir !== ".next" ||
    config.productionBrowserSourceMaps !== false
  )
    throw Error("Invalid production build target or source map policy");
  const paths = [
    ...files(root + "/static"),
    ...files(root + "/server"),
    root + "/routes-manifest.json",
    root + "/required-server-files.json",
  ];
  const hash = createHash("sha256");
  const findings: Finding[] = [];
  for (const path of paths.sort()) {
    const name = path.slice(root.length + 1),
      bytes = readFileSync(path);
    hash.update(name + "\0").update(bytes);
    if (/\.(?:js|json|html|rsc|css|map)$/.test(path)) {
      const map = existsSync(path + ".map")
        ? readFileSync(path + ".map", "utf8")
        : undefined;
      findings.push(...inspectFile(name, bytes.toString(), map));
    }
    if (path.endsWith(".nft.json")) {
      const traced = JSON.parse(bytes.toString()).files as string[];
      for (const p of traced) {
        // pnpm peer labels may mention playwright without tracing its actual package.
        const actual = p.split("node_modules/").pop()!;
        if (
          /^(?:vitest\/|@vitest\/|@playwright\/|playwright\/|@testing-library\/)/.test(
            actual,
          )
        )
          findings.push(
            finding("artifact", "runtime-test-dependency", "high", name),
          );
        if (/(?:e2e|integration)\/(?:fixtures|helpers)\//.test(p))
          findings.push(finding("artifact", "test-code", "high", name));
      }
    }
  }
  return {
    app,
    build_id: readFileSync(root + "/BUILD_ID", "utf8").trim(),
    artifact_digest: hash.digest("hex"),
    files: paths.length,
    findings,
    framework_console_allowlist: frameworkConsole,
  };
}
