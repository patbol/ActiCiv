import { expect, it } from "vitest";
import { validReconstruction } from "./reconstruction";
it("accepts every migration actually present, including locale migration, and rejects missing/extra versions", () => {
  const actual = {
    versions: ["20260801000100", "20260918000100"],
    organizations: 3,
    profiles: 9,
    services: 6,
    territories: 3,
    postgis: "3.3",
  };
  expect(validReconstruction(actual, actual.versions)).toBe(true);
  expect(validReconstruction(actual, actual.versions.slice(0, 1))).toBe(false);
  expect(
    validReconstruction(
      { ...actual, versions: actual.versions.slice(0, 1) },
      actual.versions,
    ),
  ).toBe(false);
  expect(validReconstruction({ ...actual, profiles: 0 }, actual.versions)).toBe(
    false,
  );
});
