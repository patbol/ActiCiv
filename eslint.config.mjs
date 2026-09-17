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
  {
    files: [
      "packages/backend/src/modules/**/domain/**/*.ts",
      "packages/backend/src/modules/**/application/**/*.ts",
    ],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "react",
                "@supabase/*",
                "**/infrastructure/**",
                "**/platform/**",
                "server-only",
                "@js-temporal/*",
                "node:*",
                "http",
                "https",
                "http2",
                "net",
                "tls",
                "dns",
                "dgram",
                "child_process",
                "worker_threads",
                "axios",
                "axios/*",
                "undici",
                "undici/*",
                "node-fetch",
                "cross-fetch",
                "got",
                "got/*",
                "ky",
                "ws",
                "socket.io-client",
              ],
              message:
                "Domain and use cases must depend only on domain types and explicit ports.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "fetch",
        "WebSocket",
        "XMLHttpRequest",
        "EventSource",
        "WebTransport",
        "navigator",
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression",
          message:
            "Dynamic imports are forbidden in domain/use cases; inject a port.",
        },
        {
          selector: "CallExpression[callee.name='require']",
          message: "CommonJS imports are forbidden in domain/use cases.",
        },
        {
          selector:
            "MemberExpression[object.name=/^(globalThis|global|window|self)$/]",
          message: "Global runtime access belongs in adapters.",
        },
        {
          selector:
            "VariableDeclarator[init.name=/^(globalThis|global|window|self)$/]",
          message: "Do not alias the runtime in domain/use cases.",
        },
        {
          selector: "CallExpression[callee.name='eval']",
          message: "Dynamic code is forbidden in domain/use cases.",
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: "Dynamic code is forbidden in domain/use cases.",
        },
      ],
    },
  },
]);
