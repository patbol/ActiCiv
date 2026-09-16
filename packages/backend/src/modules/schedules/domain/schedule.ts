export type Window = readonly [number, number];
export type Day = {
  weekday: number;
  open: boolean;
  windows: readonly Window[];
};
export type Schedule = {
  timezone: string;
  mode: "weekly" | "always_open";
  days: readonly Day[];
};
export function validateSchedule(schedule: Schedule): void {
  if (!schedule.timezone || !["weekly", "always_open"].includes(schedule.mode))
    throw new Error("Calendrier invalide");
  if (schedule.mode === "always_open") {
    if (schedule.days.length)
      throw new Error("24/7 ne contient pas de jours hebdomadaires");
    return;
  }
  if (
    schedule.days.length !== 7 ||
    new Set(schedule.days.map((d) => d.weekday)).size !== 7
  )
    throw new Error("Sept jours explicites requis");
  for (const day of schedule.days) {
    if (
      !Number.isInteger(day.weekday) ||
      day.weekday < 1 ||
      day.weekday > 7 ||
      day.open !== day.windows.length > 0
    )
      throw new Error("Jour invalide");
    let previousEnd = -1;
    for (const [start, end] of [...day.windows].sort((a, b) => a[0] - b[0])) {
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 0 ||
        end > 86400 ||
        start >= end ||
        start < previousEnd
      )
        throw new Error("Créneaux invalides ou chevauchants");
      previousEnd = end;
    }
  }
}
