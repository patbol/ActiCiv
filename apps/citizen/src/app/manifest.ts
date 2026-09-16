import type { MetadataRoute } from "next";
import { brand } from "@acticiv/shared";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: brand.colors.primary,
    icons: [{ src: brand.favicon, sizes: "any", type: "image/svg+xml" }],
  };
}
