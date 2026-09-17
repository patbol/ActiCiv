import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { citizenLocale, localeCookie } from "@acticiv/shared/locale";
import { loadMessages } from "@acticiv/shared/messages";
export default getRequestConfig(async () => {
  const locale = citizenLocale({
    explicit: (await cookies()).get(localeCookie)?.value ?? null,
    browser: (await headers()).get("accept-language"),
  });
  return { locale, messages: await loadMessages(locale) };
});
