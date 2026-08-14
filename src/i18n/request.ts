import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/i18n/locales";

type Messages = { [key: string]: string | Messages };

/**
 * Fills gaps in a translation from the source language. Recursive rather than a spread,
 * because a top-level spread would swap out whole namespaces — one untranslated key inside
 * `cart` would take the rest of the Spanish `cart` block down with it.
 */
function withFallback(base: Messages, override: Messages): Messages {
  const merged: Messages = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const fallbackValue = base[key];

    merged[key] =
      typeof value === "object" && typeof fallbackValue === "object"
        ? withFallback(fallbackValue, value)
        : value;
  }

  return merged;
}

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const source = (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default;

  if (locale === DEFAULT_LOCALE) return { locale, messages: source };

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages: withFallback(source, messages) };
});
