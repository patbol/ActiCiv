import { localeSaved, type Telemetry } from "./telemetry";
import type { CommandContext } from "./correlation";
import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfessionalContext } from "../modules/authorization/application/context";
import { supabaseContext } from "../modules/authorization/infrastructure/supabase-context";
import { setOwnLocale } from "../modules/locales/application/preferences";
import { localePreferences } from "../modules/locales/infrastructure/preferences";
const schema = z.strictObject({
  locale: z.enum(["fr-FR", "en-GB"]).nullable(),
});
export async function changeLocalePreference(
  client: SupabaseClient,
  input: unknown,
  observation?: { telemetry: Telemetry; context: CommandContext },
) {
  const value = schema.parse(input);
  const context = await getProfessionalContext(supabaseContext(client));
  await setOwnLocale(context, value.locale, localePreferences(client));
  if (observation)
    localeSaved(
      observation.telemetry,
      observation.context,
      "pro",
      value.locale,
      "profile",
    );
}
