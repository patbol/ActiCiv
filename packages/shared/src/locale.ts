export const locales = ["fr-FR", "en-GB"] as const;
export type Locale = (typeof locales)[number];
export const fallbackLocale: Locale = "fr-FR";
export const localeCookie = "acticiv-locale";
export function isLocale(value: unknown): value is Locale {
  return value === "fr-FR" || value === "en-GB";
}
const supported = (value: unknown): Locale | null =>
  isLocale(value) ? value : null;

/** Accept-Language ranges, quality weights and stable tie ordering. A wildcard
 * expresses no language preference and leaves the application fallback intact. */
export function browserLocale(
  header: string | null | undefined,
): Locale | null {
  const candidates = (header ?? "")
    .slice(0, 8192)
    .split(",")
    .flatMap((part, order) => {
      const match =
        /^\s*([a-z]{1,8}(?:-[a-z0-9]{1,8})*|\*)\s*(?:;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/i.exec(
          part,
        );
      if (!match) return [];
      const language = match[1]?.toLowerCase().split("-")[0];
      const locale =
        language === "fr" ? "fr-FR" : language === "en" ? "en-GB" : null;
      const quality = Number(match[2] ?? 1);
      return locale && quality > 0
        ? [{ locale: locale as Locale, quality, order }]
        : [];
    });
  return (
    candidates.sort((a, b) => b.quality - a.quality || a.order - b.order)[0]
      ?.locale ?? null
  );
}
type BrowserPreference = { explicit?: string | null; browser?: string | null };
export function citizenLocale(
  input: BrowserPreference & { territory?: string | null },
): Locale {
  return (
    supported(input.explicit) ??
    browserLocale(input.browser) ??
    supported(input.territory) ??
    fallbackLocale
  );
}
export function proLocale(
  input: BrowserPreference & {
    preferred?: string | null;
    organization?: string | null;
  },
): Locale {
  return (
    supported(input.preferred) ??
    supported(input.organization) ??
    supported(input.explicit) ??
    browserLocale(input.browser) ??
    fallbackLocale
  );
}
export function referenceLabel(
  entity: {
    code: string;
    label: string;
    translations: Partial<Record<Locale, string>>;
  },
  locale: Locale,
): string {
  return entity.translations[locale] ?? entity.label;
}
export const formatDate = (date: Date, locale: Locale, timezone: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: timezone }).format(date);
export const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale).format(value);
export const formatRelative = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale,
) =>
  new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(value, unit);
export const pluralCategory = (value: number, locale: Locale) =>
  new Intl.PluralRules(locale).select(value);
