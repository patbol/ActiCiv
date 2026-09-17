import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "tooling/quality/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "packages/*/src/**/*.{ts,tsx}",
        "apps/*/src/**/*.{ts,tsx}",
        "tooling/**/*.{ts,mjs}",
        "scripts/**/*.{ts,mjs}",
      ],
      exclude: ["**/*.test.ts", "**/*.d.ts"],
      reporter: ["text", "json", "json-summary", "lcov"],
      reportsDirectory: process.env.ACTICIV_COVERAGE_DIR ?? "coverage",
      reportOnFailure: true,
    },
    clearMocks: true,
  },
});
