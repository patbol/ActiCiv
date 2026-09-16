import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleWriter } from "../modules/schedules/application/schedules";
import type { SlaWriter } from "../modules/sla/application/publish";
export async function rpc<T>(
  client: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error("Opération refusée ou configuration invalide");
  return data as T;
}
export const scheduleWriter = (client: SupabaseClient): ScheduleWriter => ({
  publish: (org, service, schedule) =>
    rpc<string>(client, "publish_schedule", {
      p_org: org,
      p_service: service,
      p_timezone: schedule.timezone,
      p_mode: schedule.mode,
      p_days: schedule.days,
    }),
});
export const slaWriter = (client: SupabaseClient): SlaWriter => ({
  publish: (org, scope, calendar, targets) =>
    rpc<string>(client, "publish_sla", {
      p_org: org,
      p_service: scope.serviceId,
      p_category: scope.categoryId,
      p_calendar: calendar,
      p_targets: targets,
    }),
});
