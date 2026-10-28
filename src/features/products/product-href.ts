/** Every product page lives under this. Client-safe: no server imports. */
export function productHref(handle: string): string {
  return `/products/${handle}`;
}
