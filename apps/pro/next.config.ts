import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: [
    "@acticiv/ui",
    "@acticiv/shared",
    "@acticiv/types",
    "@acticiv/backend",
  ],
  poweredByHeader: false,
  // Keep localized metadata available with the initial UI, including Auth errors.
  htmlLimitedBots: /.*/,
};
export default createNextIntlPlugin("./src/i18n/request.ts")(config);
