import type { Locale } from "@/i18n/locales";

export function formatPrice(
  amount: string,
  currencyCode: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(Number.parseFloat(amount));
}

/** The number format behind each site locale — the store sells in COP from Colombia */
export function priceLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-CO";
}
