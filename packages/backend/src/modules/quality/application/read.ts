export type PlatformReader = {
  read(): Promise<{
    userId: string;
    active: boolean;
    capabilities: readonly string[];
  } | null>;
};
export type QualityQuery = {
  run?: string;
  environment?: string;
  status?: string;
  offset?: number;
  baseline?: string;
};
export type QualityReader<T> = { list(query: QualityQuery): Promise<T> };
export async function readQuality<T>(
  identity: PlatformReader,
  reader: QualityReader<T>,
  query: QualityQuery,
): Promise<T> {
  const platform = await identity.read();
  if (
    !platform?.active ||
    !platform.userId ||
    !platform.capabilities.includes("quality.read")
  )
    throw Error("QUALITY_FORBIDDEN");
  return reader.list(query);
}
