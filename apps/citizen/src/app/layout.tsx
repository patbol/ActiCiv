import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brand } from "@acticiv/shared";
import "@acticiv/ui/styles.css";
export const metadata: Metadata = {
  title: brand.name,
  description: brand.description,
  icons: { icon: brand.favicon },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={
          {
            "--brand-primary": brand.colors.primary,
            "--brand-secondary": brand.colors.secondary,
          } as CSSProperties
        }
      >
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
