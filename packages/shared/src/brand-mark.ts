import { brand } from "./index";
/** Single asset source: provisional mark, replace here when the brand changes. */
export function brandMarkSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="${brand.colors.primary}"/><path d="M16 44 29 18h7l13 26h-9l-3-7H26l-3 7zm13-14h5l-2-6z" fill="white"/></svg>`;
}
