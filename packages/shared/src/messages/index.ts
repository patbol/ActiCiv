import type { Locale } from "../locale";
// Explicit imports allow server bundlers to trace catalogues. Do not import this
// module into a Client Component; pass the small translated prop set it needs.
export async function loadMessages(locale: Locale) {
  if (locale === "en-GB") {
    const [common, foundation, dialog, auth] = await Promise.all([
      import("./en-GB/common.json"),
      import("./en-GB/foundation.json"),
      import("./en-GB/dialog.json"),
      import("./en-GB/auth.json"),
    ]);
    return {
      common: common.default,
      foundation: foundation.default,
      dialog: dialog.default,
      auth: auth.default,
    };
  }
  const [common, foundation, dialog, auth] = await Promise.all([
    import("./fr-FR/common.json"),
    import("./fr-FR/foundation.json"),
    import("./fr-FR/dialog.json"),
    import("./fr-FR/auth.json"),
  ]);
  return {
    common: common.default,
    foundation: foundation.default,
    dialog: dialog.default,
    auth: auth.default,
  };
}
