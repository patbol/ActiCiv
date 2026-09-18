import type { Locale } from "../locale";
export async function loadQualityMessages(locale: Locale) {
  return (
    locale === "en-GB"
      ? await import("./en-GB/quality.json")
      : await import("./fr-FR/quality.json")
  ).default;
}
