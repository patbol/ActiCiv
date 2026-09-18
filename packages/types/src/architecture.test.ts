import { ESLint } from "eslint";
import { it, expect } from "vitest";
it("rejects server/database imports in public packages", async () => {
  const eslint = new ESLint();
  for (const filePath of [
    "packages/ui/src/forbidden.ts",
    "packages/shared/src/forbidden.ts",
    "packages/types/src/forbidden.ts",
  ]) {
    const result = await eslint.lintText(
      "import { parseServerEnv } from '@acticiv/backend'; export { parseServerEnv };",
      { filePath },
    );
    expect(
      result
        .flatMap((r) => r.messages)
        .some((m) => m.ruleId === "no-restricted-imports"),
    ).toBe(true);
  }
}, 15000);
it("rejects HTTP and network access in domain/application while allowing adapters", async () => {
  const eslint = new ESLint();
  const programs = [
    ...[
      "http",
      "https",
      "node:http",
      "node:https",
      "node:net",
      "node:tls",
      "dns",
      "dgram",
      "axios",
      "undici",
      "node-fetch",
      "ws",
    ].map((name) => `import * as x from '${name}'; export { x };`),
    "export const x = () => fetch('https://example.test');",
    "export const x = () => globalThis.fetch('https://example.test');",
    "export const x = () => globalThis['fetch']('https://example.test');",
    "export const x = () => new WebSocket('wss://example.test');",
    "export const x = () => new XMLHttpRequest();",
    "export const x = () => new EventSource('https://example.test');",
    "export const x = () => import('node:http');",
    "export const x = require('https');",
    "const {fetch: request} = globalThis; export {request};",
  ];
  for (const layer of ["domain", "application"]) {
    for (const code of programs) {
      const result = await eslint.lintText(code, {
        filePath: `packages/backend/src/modules/auth/${layer}/network-probe.ts`,
      });
      expect(
        result
          .flatMap((r) => r.messages)
          .some((m) =>
            [
              "no-restricted-imports",
              "no-restricted-globals",
              "no-restricted-syntax",
            ].includes(m.ruleId ?? ""),
          ),
        code,
      ).toBe(true);
    }
  }
  const result = await eslint.lintText(
    "export const request = () => fetch('https://example.test');",
    {
      filePath:
        "packages/backend/src/modules/auth/infrastructure/network-probe.ts",
    },
  );
  expect(result.flatMap((r) => r.messages)).toEqual([]);
}, 15000);
it("rejects infrastructure imports in critical domain and use cases", async () => {
  const eslint = new ESLint();
  for (const filePath of [
    "packages/backend/src/modules/sla/domain/forbidden.ts",
    "packages/backend/src/modules/auth/application/forbidden.ts",
  ]) {
    for (const importedModule of [
      "@supabase/supabase-js",
      "next/headers",
      "../infrastructure/client",
      "@js-temporal/polyfill",
    ]) {
      const result = await eslint.lintText(
        `import x from '${importedModule}'; export { x };`,
        { filePath },
      );
      expect(
        result
          .flatMap((r) => r.messages)
          .some((m) => m.ruleId === "no-restricted-imports"),
      ).toBe(true);
    }
  }
}, 15000);
it("observability server contracts cannot cross a client entrypoint, including dynamic imports", async () => {
  const eslint = new ESLint();
  for (const statement of [
    "import { logger } from '@acticiv/backend/observability'; export {logger};",
    "const x=import('@acticiv/backend/observability'); export {x};",
    "export {logger} from '../../../../packages/backend/src/platform/observability';",
  ]) {
    const r = await eslint.lintText('"use client"; ' + statement, {
      filePath: "apps/pro/src/app/probe.tsx",
    });
    expect(
      r
        .flatMap((x) => x.messages)
        .some((x) => x.ruleId === "acticiv/production-boundaries"),
    ).toBe(true);
  }
}, 15000);
