import "server-only";
import { cookies } from "next/headers";
import { createProfessionalClient } from "@acticiv/backend";
export async function professionalClient(correlationId?: string) {
  const store = await cookies();
  return createProfessionalClient(
    process.env,
    {
      getAll: () => store.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) {
          store.set(name, value, options);
        }
      },
    },
    correlationId,
  );
}
export function professionalOrigin() {
  const origin = process.env.PRO_APP_ORIGIN ?? "http://127.0.0.1:3001";
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    (url.protocol !== "https:" &&
      !["127.0.0.1", "localhost"].includes(url.hostname))
  )
    throw new Error("Origine Pro invalide");
  return origin;
}
