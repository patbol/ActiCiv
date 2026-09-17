export function validReconstruction(
  actual: {
    versions: string[];
    organizations: number;
    profiles: number;
    services: number;
    territories: number;
    postgis: string;
  },
  expected: string[],
) {
  return (
    JSON.stringify([...actual.versions].sort()) ===
      JSON.stringify([...expected].sort()) &&
    actual.organizations === 3 &&
    actual.profiles === 9 &&
    actual.services === 6 &&
    actual.territories === 3 &&
    Boolean(actual.postgis)
  );
}
