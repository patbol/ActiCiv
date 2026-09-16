import { Temporal } from "@js-temporal/polyfill";
import type { ZonedTime } from "../application/schedules";
export const zonedTime: ZonedTime = {
  assertTimezone(zone) {
    if (/^[+-]/.test(zone)) throw new Error("Fuseau IANA requis");
    new Intl.DateTimeFormat("fr-FR", { timeZone: zone }).format(0);
  },
  weekday(date) {
    return Temporal.PlainDate.from(date).dayOfWeek;
  },
  resolve(date, second, zone) {
    const local = Temporal.PlainDate.from(date)
      .toPlainDateTime()
      .add({ seconds: second });
    const earlier = local.toZonedDateTime(zone, { disambiguation: "earlier" });
    if (earlier.toPlainDateTime().equals(local))
      return earlier.epochMilliseconds;
    // A gap: locate its transition, not local time + gap duration.
    const transition = earlier.getTimeZoneTransition("next");
    const later = local.toZonedDateTime(zone, { disambiguation: "later" });
    if (!transition || transition.epochMilliseconds > later.epochMilliseconds)
      throw new Error("Transition horaire introuvable");
    return transition.epochMilliseconds;
  },
};
