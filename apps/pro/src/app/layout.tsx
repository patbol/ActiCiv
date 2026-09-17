import { currentPreferences } from "../i18n/preferences";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { LocaleControl } from "../components/locale-control";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brand } from "@acticiv/shared";
import "@acticiv/ui/styles.css";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: brand.name,
    description: t("description"),
    icons: { icon: brand.favicon },
  };
}
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  const preferences = await currentPreferences();

  return (
    <html lang={locale}>
      <body
        style={
          {
            "--brand-primary": brand.colors.primary,
            "--brand-secondary": brand.colors.secondary,
          } as CSSProperties
        }
      >
        <a className="skip-link" href="#main">
          {t("skip")}
        </a>
        <NextIntlClientProvider
          locale={locale}
          messages={{
            common: {
              errorTitle: t("errorTitle"),
              errorBody: t("errorBody"),
              retry: t("retry"),
            },
          }}
        >
          {children}
        </NextIntlClientProvider>
        <LocaleControl
          value={preferences ? (preferences.preferred ?? "inherit") : locale}
          inherit={preferences !== null}
          labels={{
            label: t("localeLabel"),
            inherit: t("inherit"),
            saved: t("localeSaved"),
            failed: t("localeFailed"),
            saving: t("localeSaving"),
          }}
        />
      </body>
    </html>
  );
}
