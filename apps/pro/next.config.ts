import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: [
    "@acticiv/ui",
    "@acticiv/shared",
    "@acticiv/types",
    "@acticiv/backend",
  ],
  poweredByHeader: false,
};
export default config;
