import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
const target = process.env.ACTICIV_BUILD_TARGET ?? "prod";
if (!["prod", "demo"].includes(target)) throw new Error("Invalid build target");
const config: NextConfig = {
  distDir: target === "demo" ? ".next-demo" : ".next",
  productionBrowserSourceMaps: false,
  turbopack: {
    resolveAlias:
      target === "demo"
        ? {
            "@acticiv/ui/foundation-preview":
              "./src/components/demo-preview.tsx",
          }
        : {},
  },
  transpilePackages: [
    "@acticiv/ui",
    "@acticiv/shared",
    "@acticiv/types",
    "@acticiv/backend",
  ],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  // Keep localized metadata available with the initial UI, including Auth errors.
  htmlLimitedBots: /.*/,
};
export default createNextIntlPlugin("./src/i18n/request.ts")(config);
