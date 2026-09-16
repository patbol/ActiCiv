export type Candidate = {
  organization_id: string;
  contract_id: string;
  territory_id: string;
};
export function coordinates(longitude: number, latitude: number) {
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  )
    throw new Error("Coordonnées invalides");
  return { longitude, latitude };
}
