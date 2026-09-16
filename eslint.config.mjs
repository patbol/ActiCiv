import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
export default defineConfig([
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    settings: { next: { rootDir: ["apps/citizen/", "apps/pro/"] } },
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
  {
    files: [
      "packages/ui/**/*.{ts,tsx}",
      "packages/shared/**/*.ts",
      "packages/types/**/*.ts",
      "apps/*/src/components/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@acticiv/backend",
                "@acticiv/backend/*",
                "**/backend/**",
                "@supabase/*",
                "server-only",
              ],
              message:
                "Public UI/contracts must not import server or database modules.",
            },
          ],
        },
      ],
    },
  },
]);
