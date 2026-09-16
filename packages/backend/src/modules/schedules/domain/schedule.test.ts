import { it, expect } from "vitest";
import { validateSchedule, type Schedule } from "./schedule";
import { windowsForDate } from "../application/schedules";
import { zonedTime } from "../infrastructure/temporal";
const always: Schedule = {
  timezone: "Europe/Paris",
  mode: "always_open",
  days: [],
};
it("uses first occurrence at fallback and first valid instant after a gap", () => {
  expect(
    new Date(
      zonedTime.resolve("2026-10-25", 2 * 3600 + 1800, "Europe/Paris"),
    ).toISOString(),
  ).toBe("2026-10-25T00:30:00.000Z");
  expect(
    new Date(
      zonedTime.resolve("2026-03-29", 2 * 3600 + 1800, "Europe/Paris"),
    ).toISOString(),
  ).toBe("2026-03-29T01:00:00.000Z");
  expect(
    new Date(
      zonedTime.resolve("2026-10-04", 2 * 3600 + 900, "Australia/Lord_Howe"),
    ).toISOString(),
  ).toBe("2026-10-03T15:30:00.000Z");
});
it("counts actual 23/25-hour days in 24/7 schedules", () => {
  for (const [date, hours] of [
    ["2026-03-29", 23],
    ["2026-10-25", 25],
  ] as const) {
    const [window] = windowsForDate(always, date, zonedTime);
    expect(window && (window[1] - window[0]) / 3600000).toBe(hours);
  }
});
it("validates explicit days, adjacent windows, closed days and midnight", () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    weekday: i + 1,
    open: i === 0,
    windows:
      i === 0
        ? ([
            [0, 3600],
            [3600, 86400],
          ] as [number, number][])
        : [],
  }));
  expect(() =>
    validateSchedule({ ...always, mode: "weekly", days }),
  ).not.toThrow();
  expect(() =>
    validateSchedule({ ...always, mode: "weekly", days: days.slice(1) }),
  ).toThrow();
  expect(() =>
    validateSchedule({
      ...always,
      mode: "weekly",
      days: days.map((d) =>
        d.weekday === 1
          ? {
              ...d,
              windows: [
                [0, 4000],
                [3600, 5000],
              ],
            }
          : d,
      ),
    }),
  ).toThrow();
  expect(() =>
    validateSchedule({
      ...always,
      mode: "weekly",
      days: days.map((d) => ({ ...d, open: false })),
    }),
  ).toThrow();
  expect(() => zonedTime.assertTimezone("Not/A_Zone")).toThrow();
});
