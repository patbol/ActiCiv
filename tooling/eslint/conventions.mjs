// Small local ESLint rules; no runtime dependency or application import.
const criticalities = new Set(["@critical", "@high", "@medium", "@low"]);
const tagPattern =
  /^@(critical|high|medium|low|(?:route|component):[a-z][a-z0-9]*(?:-[a-z0-9]+)*|type:(?:security|a11y|smoke|regression))$/;
const key = (node) => (node?.type === "Identifier" ? node.name : node?.value);
function chain(node) {
  if (node?.type === "Identifier") return [node.name];
  if (node?.type === "MemberExpression") {
    const property = node.computed ? node.property.value : node.property.name;
    return [...chain(node.object), property];
  }
  return [];
}
const metadata = (create) => ({
  meta: { type: "problem", schema: [] },
  create,
});

const e2eMetadata = metadata((context) => {
  const names = new Set(["test"]);
  const kind = (node) => {
    const parts = chain(node.callee);
    if (!names.has(parts[0])) return null;
    if (parts[1] === "describe" && !parts.includes("configure")) return "suite";
    return parts.length === 1 ? "test" : null;
  };
  function tags(node) {
    const details = node.arguments[1];
    if (details?.type !== "ObjectExpression") return [];
    if (details.properties.some((p) => p.type === "SpreadElement"))
      context.report({
        node: details,
        message:
          "Do not spread test details; metadata must remain statically reviewable.",
      });
    const prop = details.properties.find((p) => key(p.key) === "tag");
    if (!prop) return [];
    const values =
      prop.value.type === "ArrayExpression"
        ? prop.value.elements
        : [prop.value];
    if (
      !values.every((n) => n?.type === "Literal" && typeof n.value === "string")
    ) {
      context.report({
        node: prop,
        message: "Tags must be static strings in the declaration metadata.",
      });
      return [];
    }
    return values.map((n) => n.value);
  }
  return {
    ImportSpecifier(node) {
      if (key(node.imported) === "test") names.add(node.local.name);
    },
    VariableDeclarator(node) {
      if (names.has(chain(node.init)[0]))
        context.report({
          node,
          message:
            "Use the named imported test binding directly; do not alias test declarations.",
        });
    },
    CallExpression(node) {
      const type = kind(node);
      if (!type) return;
      const ownTags = tags(node);
      for (const tag of ownTags) {
        if (!tagPattern.test(tag))
          context.report({ node, message: `Invalid test tag: ${tag}` });
      }
      const title = context.sourceCode.getText(node.arguments[0] ?? node);
      if (
        /@(?:critical|high|medium|low|route:|component:|type:|broken|flaky|todo)/.test(
          title,
        )
      )
        context.report({
          node,
          message: "Put tags in the tag metadata, not in titles.",
        });
      const critical = ownTags.filter((t) => criticalities.has(t));
      if (type === "suite" && critical.length)
        context.report({
          node,
          message: "Criticality belongs on each test, never on a suite.",
        });
      if (type !== "test") return;
      if (critical.length !== 1)
        context.report({
          node,
          message: "Each test must declare exactly one criticality.",
        });
      const body = node.arguments.at(-1);
      if (
        !["ArrowFunctionExpression", "FunctionExpression"].includes(body?.type)
      )
        context.report({
          node,
          message:
            "A scenario needs an explicit callback; pending tests are not approved.",
        });
      const inherited = context.sourceCode
        .getAncestors(node)
        .filter((n) => n.type === "CallExpression" && kind(n) === "suite")
        .flatMap(tags);
      for (const prefix of ["@route:", "@component:"]) {
        if (!inherited.some((t) => t.startsWith(prefix)))
          context.report({
            node,
            message: `A containing suite must declare ${prefix} metadata.`,
          });
      }
    },
  };
});

const e2eExecution = metadata((context) => {
  const forbidden = new Set(["only", "skip", "fixme", "waitForTimeout"]);
  const report = (node) =>
    context.report({
      node,
      message:
        "Focus, skips/fixme and arbitrary waits are not approved. Use observable waits; any exception needs a reviewed policy change.",
    });
  return {
    MemberExpression(node) {
      if (
        forbidden.has(node.computed ? node.property.value : node.property.name)
      )
        report(node);
    },
    Property(node) {
      if (node.parent.type === "ObjectPattern" && forbidden.has(key(node.key)))
        report(node);
    },
    Identifier(node) {
      if (/^(fit|ftest|fdescribe|xit|xtest|xdescribe)$/.test(node.name))
        report(node);
    },
  };
});

const providerPackages =
  /^(?:@next\/third-parties\/google|react-ga(?:4)?|react-gtm-module|gtag\.js|@google-analytics\/|@gtm-support\/|posthog-js|mixpanel-browser|@amplitude\/)/;
const testPackages =
  /^(?:@playwright\/|playwright(?:\/|$)|vitest(?:\/|$)|@vitest\/|@axe-core\/)|(?:^|\/)(?:e2e|fixtures|__tests__|test-helpers)(?:\/|$)|\.(?:test|spec)(?:\.[cm]?[jt]sx?)?$/;
const productionBoundaries = metadata((context) => {
  const isClient = context.sourceCode.ast.body.some(
    (node) =>
      node.type === "ExpressionStatement" && node.directive === "use client",
  );
  const report = (node, message) => context.report({ node, message });
  const imported = (node, source) => {
    if (typeof source !== "string") return;
    if (
      isClient &&
      /^(?:@acticiv\/(?:backend|quality)(?:\/|$)|server-only$)|(?:^|\/)(?:backend|quality)\/src\//.test(
        source,
      )
    )
      report(
        node,
        "Client entrypoints must not import server observability, audit or backend modules.",
      );
    if (providerPackages.test(source))
      report(
        node,
        "Analytics providers belong in a reviewed adapter. No vendor provider is enabled in 2bis-F.",
      );
    if (testPackages.test(source))
      report(
        node,
        "Production modules must not import test packages or fixtures.",
      );
  };
  return {
    ImportDeclaration(node) {
      imported(node, node.source.value);
    },
    ExportNamedDeclaration(node) {
      imported(node, node.source?.value);
    },
    ExportAllDeclaration(node) {
      imported(node, node.source.value);
    },
    ImportExpression(node) {
      imported(node, node.source.value);
    },
    CallExpression(node) {
      if (node.callee.name === "require")
        imported(node, node.arguments[0]?.value);
    },
    MemberExpression(node) {
      const parts = chain(node);
      const method = parts.at(-1);
      if (
        parts.at(-2) === "console" &&
        ["log", "debug", "trace"].includes(method)
      )
        report(
          node,
          "Production debug output is forbidden; use the approved logging boundary.",
        );
      if (["gtag", "dataLayer"].includes(method))
        report(
          node,
          "Direct analytics provider access is forbidden outside a reviewed adapter.",
        );
    },
    Identifier(node) {
      if (["gtag", "dataLayer"].includes(node.name))
        report(
          node,
          "Direct analytics provider access is forbidden outside a reviewed adapter.",
        );
    },
    VariableDeclarator(node) {
      if (node.id.type === "ObjectPattern") {
        for (const p of node.id.properties) {
          if (key(p.key) === "console")
            report(
              p,
              "Do not destructure the console object in production code.",
            );
        }
      }
      if (
        node.id.type === "ObjectPattern" &&
        chain(node.init).at(-1) === "console"
      ) {
        for (const p of node.id.properties) {
          if (["log", "debug", "trace"].includes(key(p.key)))
            report(p, "Do not destructure production debug methods.");
        }
      }
      if (
        node.id.type === "Identifier" &&
        chain(node.init).at(-1) === "console"
      )
        report(
          node,
          "Do not alias console to bypass the production logging boundary.",
        );
    },
  };
});

const plugin = {
  rules: {
    "e2e-metadata": e2eMetadata,
    "e2e-execution": e2eExecution,
    "production-boundaries": productionBoundaries,
  },
};
export default plugin;
