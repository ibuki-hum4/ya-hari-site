import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["ja", "en"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "ja";

export default getRequestConfig(async () => {
    // Cookieから言語設定を取得
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("locale")?.value;
    
    // Accept-Languageヘッダーから言語を検出
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    const browserLocale = acceptLanguage.split(",")[0]?.split("-")[0];
    
    // 優先順位: Cookie > ブラウザ設定 > デフォルト
    let locale: Locale = defaultLocale;
    
    if (localeCookie && locales.includes(localeCookie as Locale)) {
        locale = localeCookie as Locale;
    } else if (browserLocale && locales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
