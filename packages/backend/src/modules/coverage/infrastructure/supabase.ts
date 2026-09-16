import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoverageReader } from "../application/candidates";
import { rpc } from "../../../platform/commands";
export const coverageReader = (client: SupabaseClient): CoverageReader => ({
  candidates: (longitude, latitude, category) =>
    rpc(client, "coverage_candidates", {
      p_longitude: longitude,
      p_latitude: latitude,
      p_category: category,
    }),
});
