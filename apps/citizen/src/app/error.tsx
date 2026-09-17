"use client";
import { useTranslations } from "next-intl";
import { Button } from "@acticiv/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("common");
  return (
    <main id="main" className="shell">
      <h1>{t("errorTitle")}</h1>
      <p>{t("errorBody")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </main>
  );
}
