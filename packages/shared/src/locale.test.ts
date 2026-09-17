import { describe, expect, it } from "vitest";
import {
  browserLocale,
  citizenLocale,
  proLocale,
  referenceLabel,
  formatDate,
  formatNumber,
  formatRelative,
  pluralCategory,
} from "./locale";

describe("locale policy independent of HTTP and timezone", () => {
  it.each([
    ["en-GB,en;q=0.9,fr;q=0.8", "en-GB"],
    ["fr-FR,fr;q=0.9,en;q=0.5", "fr-FR"],
    ["de-DE,en-GB;q=0.7", "en-GB"],
    ["fr;q=0.2,en;q=0.8", "en-GB"],
    ["en;q=0,fr;q=1", "fr-FR"],
    ["fr-CA,en-US;q=0.5", "fr-FR"],
    ["en-US", "en-GB"],
    ["*", null],
    ["de-DE", null],
    ["garbage!,en;q=2,fr;q=no", null],
    ["en;q=.9", null],
    ["en;q=0.9999", null],
    ["en;level=1", null],
    ["", null],
  ])("negotiates %s", (header, expected) =>
    expect(browserLocale(header)).toBe(expected),
  );
  it("Citizen explicit > browser > existing territory > fallback", () => {
    expect(citizenLocale({ explicit: "fr-FR", browser: "en" })).toBe("fr-FR");
    expect(citizenLocale({ browser: "en", territory: "fr-FR" })).toBe("en-GB");
    expect(citizenLocale({ browser: "de", territory: "en-GB" })).toBe("en-GB");
    expect(citizenLocale({ explicit: "invalid" })).toBe("fr-FR");
  });
  it("Pro profile > organization > explicit cookie > browser > fallback; null restores inheritance", () => {
    expect(
      proLocale({
        preferred: "en-GB",
        organization: "fr-FR",
        explicit: "fr-FR",
      }),
    ).toBe("en-GB");
    expect(
      proLocale({ preferred: null, organization: "en-GB", browser: "fr" }),
    ).toBe("en-GB");
    expect(
      proLocale({
        preferred: "bad",
        organization: "bad",
        explicit: "en-GB",
        browser: "fr",
      }),
    ).toBe("en-GB");
    expect(proLocale({ browser: "en" })).toBe("en-GB");
    expect(proLocale({})).toBe("fr-FR");
  });
  it("labels have a historical fallback and never change codes", () => {
    const entity = {
      code: "blocked_access",
      label: "Accès bloqué",
      translations: { "en-GB": "Blocked access", "fr-FR": "Accès bloqué" },
    };
    expect(referenceLabel(entity, "en-GB")).toBe("Blocked access");
    expect(referenceLabel(entity, "fr-FR")).toBe("Accès bloqué");
    expect(referenceLabel({ ...entity, translations: {} }, "en-GB")).toBe(
      "Accès bloqué",
    );
    expect(entity.code).toBe("blocked_access");
  });
  it("formats with an explicit timezone and does not derive it from locale", () => {
    const date = new Date("2026-01-01T23:30:00Z");
    expect(formatDate(date, "en-GB", "Europe/Paris")).toContain("02/01/2026");
    expect(formatDate(date, "en-GB", "UTC")).toContain("01/01/2026");
    expect(formatNumber(1234.5, "en-GB")).toBe("1,234.5");
    expect(formatNumber(1234.5, "fr-FR")).toBe("1 234,5");
    expect(formatRelative(-1, "day", "en-GB")).toBe("yesterday");
    expect(pluralCategory(0, "fr-FR")).toBe("one");
    expect(pluralCategory(0, "en-GB")).toBe("other");
  });
});
