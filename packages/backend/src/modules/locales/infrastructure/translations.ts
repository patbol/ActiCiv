import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TranslationWriter } from "../application/translations";
export function translationWriter(client: SupabaseClient): TranslationWriter {
  return {
    async holdOrganization(id) {
      const { data, error } = await client
        .from("hold_reasons")
        .select("organization_id")
        .eq("id", id)
        .single();
      if (error || !data) throw new Error("Forbidden");
      return data.organization_id;
    },
    async save(kind, id, locale, label) {
      const { error } = await client.rpc("save_reference_translation", {
        p_kind: kind,
        p_entity: id,
        p_locale: locale,
        p_label: label,
      });
      if (error) throw error;
    },
  };
}
