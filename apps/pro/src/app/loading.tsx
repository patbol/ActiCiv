import { getTranslations } from "next-intl/server";
export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <main id="main" className="shell" aria-busy="true">
      <p role="status">{t("loading")}</p>
    </main>
  );
}
