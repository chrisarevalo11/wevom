import "server-only";

import type { Locale } from "@/i18n/locales";

/**
 * The `@inContext` directive every product query carries. Language follows the visitor's
 * locale; country is fixed to Colombia because the store sells in COP from a single market —
 * when more markets open, derive it from the request instead.
 */
export type StorefrontContext = {
  language: "ES" | "EN";
  country: "CO";
};

export function storefrontContext(locale: Locale): StorefrontContext {
  return {
    language: locale === "en" ? "EN" : "ES",
    country: "CO",
  };
}
