import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { proLocale, localeCookie } from "@acticiv/shared/locale";
import { loadQualityMessages } from "@acticiv/shared/quality-messages";
import { loadMessages } from "@acticiv/shared/messages";
import { currentPreferences } from "./preferences";
export default getRequestConfig(async () => {
  const preferences = await currentPreferences();
  const locale = proLocale({
    ...preferences,
    explicit: (await cookies()).get(localeCookie)?.value ?? null,
    browser: (await headers()).get("accept-language"),
  });
  return {
    locale,
    messages: {
      ...(await loadMessages(locale)),
      quality: await loadQualityMessages(locale),
    },
  };
});
