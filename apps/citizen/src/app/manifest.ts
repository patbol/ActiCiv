import { getTranslations, getLocale } from "next-intl/server";
import type { MetadataRoute } from "next";
import { brand } from "@acticiv/shared";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("common");
  const locale = await getLocale();
  return {
    name: brand.name,
    short_name: brand.shortName,
    lang: locale,
    description: t("description"),
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: brand.colors.primary,
    icons: [{ src: brand.favicon, sizes: "any", type: "image/svg+xml" }],
  };
}
