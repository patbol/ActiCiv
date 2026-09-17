import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LocalePreferences } from "../application/preferences";
import { isLocale } from "@acticiv/shared/locale";
export function localePreferences(client: SupabaseClient): LocalePreferences {
  return {
    async setOwn(locale) {
      const { error } = await client.rpc("set_preferred_locale", {
        p_locale: locale,
      });
      if (error) throw error;
    },
    async setOrganization(organization, locale) {
      const { error } = await client.rpc("set_organization_locale", {
        p_org: organization,
        p_locale: locale,
      });
      if (error) throw error;
    },
  };
}
export async function readLocalePreferences(client: SupabaseClient) {
  const { data, error } = await client.rpc("get_locale_preferences");
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  if (
    !isLocale(row.organization_locale) ||
    (row.preferred_locale !== null && !isLocale(row.preferred_locale))
  )
    throw new Error("Invalid locale projection");
  return {
    preferred: row.preferred_locale as
      import("@acticiv/shared/locale").Locale | null,
    organization: row.organization_locale,
  };
}
