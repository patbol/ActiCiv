import { validateSchedule, type Schedule } from "../domain/schedule";
import {
  requirePermission,
  type Context,
} from "../../authorization/domain/policy";
export interface ZonedTime {
  assertTimezone(zone: string): void;
  resolve(date: string, second: number, zone: string): number;
  weekday(date: string): number;
}
export interface ScheduleWriter {
  publish(
    org: string,
    service: string | null,
    schedule: Schedule,
  ): Promise<string>;
}
export async function publishSchedule(
  context: Context | null,
  org: string,
  service: string | null,
  schedule: Schedule,
  writer: ScheduleWriter,
  time: ZonedTime,
) {
  requirePermission(context, "configuration.write", { organizationId: org });
  validateSchedule(schedule);
  time.assertTimezone(schedule.timezone);
  return writer.publish(org, service, schedule);
}
export function windowsForDate(
  schedule: Schedule,
  date: string,
  time: ZonedTime,
): [number, number][] {
  validateSchedule(schedule);
  time.assertTimezone(schedule.timezone);
  const windows =
    schedule.mode === "always_open"
      ? [[0, 86400] as const]
      : (schedule.days.find((d) => d.weekday === time.weekday(date))?.windows ??
        []);
  return windows
    .map(([start, end]): [number, number] => [
      time.resolve(date, start, schedule.timezone),
      time.resolve(date, end, schedule.timezone),
    ])
    .filter(([start, end]) => end > start);
}
