import { isLocale, type Locale } from "@acticiv/shared/locale";
import {
  requirePermission,
  type Context,
} from "../../authorization/domain/policy";
import {
  requirePlatform,
  type PlatformContext,
} from "../../authorization/domain/platform";
export interface TranslationWriter {
  holdOrganization(id: string): Promise<string>;
  save(
    kind: "hold_reason" | "category" | "vertical",
    id: string,
    locale: Locale,
    label: string,
  ): Promise<void>;
}
function validate(locale: unknown, label: string): asserts locale is Locale {
  if (!isLocale(locale) || !label.trim() || label.length > 200)
    throw new Error("Invalid translation");
}
export async function saveHoldTranslation(
  context: Context | null,
  id: string,
  locale: unknown,
  label: string,
  port: TranslationWriter,
) {
  if (!context) throw new Error("Forbidden");
  requirePermission(context, "configuration.write", {
    organizationId: context.organizationId,
  });
  requirePermission(context, "configuration.write", {
    organizationId: await port.holdOrganization(id),
  });
  validate(locale, label);
  return port.save("hold_reason", id, locale, label);
}
export async function saveCatalogTranslation(
  context: PlatformContext,
  kind: "category" | "vertical",
  id: string,
  locale: unknown,
  label: string,
  port: TranslationWriter,
) {
  requirePlatform(context, "catalog.manage");
  validate(locale, label);
  return port.save(kind, id, locale, label);
}
