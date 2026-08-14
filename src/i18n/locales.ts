/**
 * Spanish is the source language: the brand writes its copy in Spanish first, and English
 * is the translation. Anything missing from en.json therefore falls back to es.json.
 */
export const DEFAULT_LOCALE = "es";

export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * The locale lives in a cookie rather than the URL, so no route carries a /es or /en
 * prefix. Trade-off worth knowing: reading the cookie makes every page dynamically
 * rendered, and both languages share one URL, so search engines only index one of them.
 */
export const LOCALE_COOKIE = "evom_locale";

/** A year — the choice should outlive the session it was made in */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && LOCALES.includes(value as Locale);
}
