import { z } from "zod";
const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});
export function parseServerEnv(input: Record<string, string | undefined>) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Configuration serveur invalide : ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }
  return result.data;
}
