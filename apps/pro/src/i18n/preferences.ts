import "server-only";
import { cache } from "react";
import { readLocalePreferences } from "@acticiv/backend";
import { professionalClient } from "../lib/auth";
// React cache deduplicates only within this server request, never across users.
export const currentPreferences = cache(async () => {
  if (!process.env.SUPABASE_PUBLISHABLE_KEY) return null;
  const client = await professionalClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  return readLocalePreferences(client);
});
