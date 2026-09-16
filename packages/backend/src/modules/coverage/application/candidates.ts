import { coordinates, type Candidate } from "../domain/coverage";
export interface CoverageReader {
  candidates(
    longitude: number,
    latitude: number,
    category: string,
  ): Promise<Candidate[]>;
}
export async function geographicCandidates(
  longitude: number,
  latitude: number,
  category: string,
  reader: CoverageReader,
) {
  coordinates(longitude, latitude);
  return reader.candidates(longitude, latitude, category);
}
