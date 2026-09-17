import { isLocale, type Locale } from "@acticiv/shared/locale";
import {
  requirePermission,
  type Context,
} from "../../authorization/domain/policy";
export interface LocalePreferences {
  setOwn(locale: Locale | null): Promise<void>;
  setOrganization(organization: string, locale: Locale): Promise<void>;
}
export async function setOwnLocale(
  context: Context | null,
  locale: unknown,
  port: LocalePreferences,
) {
  if (!context) throw new Error("Forbidden");
  requirePermission(context, "context.read", {
    organizationId: context.organizationId,
    userId: context.userId,
  });
  if (locale !== null && !isLocale(locale)) throw new Error("Invalid locale");
  return port.setOwn(locale);
}
export async function setOrganizationLocale(
  context: Context | null,
  organization: string,
  locale: unknown,
  port: LocalePreferences,
) {
  requirePermission(context, "configuration.write", {
    organizationId: organization,
  });
  if (!isLocale(locale)) throw new Error("Invalid locale");
  return port.setOrganization(organization, locale);
}
