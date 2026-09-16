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
