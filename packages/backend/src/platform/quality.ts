import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  readQuality,
  type QualityQuery,
} from "../modules/quality/application/read";
import { platformIdentity } from "../modules/quality/infrastructure/identity";
import { listRuns, readRun } from "../modules/quality/infrastructure/files";
import {
  present,
  observedComparison,
  historyDeltas,
  type Comparison,
} from "../modules/quality/infrastructure/presentation";
export async function qualityCenter(
  client: SupabaseClient,
  query: QualityQuery,
) {
  return readQuality(
    platformIdentity(client),
    {
      async list() {
        const root = process.env.ACTICIV_QUALITY_ROOT;
        if (!root)
          return {
            state: "unconfigured" as const,
            historyDeltas: historyDeltas([]),
            runs: [],
            detail: null,
            hasMore: false,
            comparison: { state: "NONE" } as Comparison,
          };
        const list = await listRuns(root, query);
        const run = query.run ? await readRun(root, query.run) : null;
        let comparison: Comparison = { state: "NONE" };
        if (run?.state === "valid" && query.baseline) {
          const baseline = await readRun(root, query.baseline);
          if (baseline.state === "valid")
            comparison = observedComparison(run.snapshot, baseline.snapshot);
          else comparison = { state: "INCOMPATIBLE" };
        }
        return {
          state: "available" as const,
          historyDeltas: historyDeltas(list.runs),
          runs: list.runs.map(present),
          detail: run ? present(run) : null,
          hasMore: list.hasMore,
          comparison,
        };
      },
    },
    query,
  );
}
export async function mayReadQuality(client: SupabaseClient) {
  try {
    return await readQuality(
      platformIdentity(client),
      { list: async () => true },
      {},
    );
  } catch {
    return false;
  }
}
export type {
  RunView,
  ValidView,
  Comparison,
} from "../modules/quality/infrastructure/presentation";
