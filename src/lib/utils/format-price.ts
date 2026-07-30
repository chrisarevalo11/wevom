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
