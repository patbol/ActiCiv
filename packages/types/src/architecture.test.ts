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
