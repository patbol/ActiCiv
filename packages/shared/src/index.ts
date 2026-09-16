export const brand = {
  name: "ActiCiv",
  shortName: "ActiCiv",
  tagline: "Voir. Signaler. Agir.",
  description: "Le citoyen signale. Le bon acteur agit.",
  logo: "/brand.svg",
  favicon: "/icon.svg",
  supportEmail: null,
  domain: null,
  colors: { primary: "#12594c", secondary: "#e9f2ed" },
} as const;
export const publicFeatures = { reporting: false } as const;
export { brandMarkSvg } from "./brand-mark";
