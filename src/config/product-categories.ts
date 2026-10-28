/**
 * The filter rail on the catalog. `all` is the default and matches everything; the rest are
 * the garment families, and each entry doubles as the key under `products.categories` in the
 * message files.
 */
export const PRODUCT_CATEGORIES = [
  "all",
  "jackets",
  "tops",
  "pants",
  "skirtsDresses",
  "accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** What a product can actually be filed under — everything but the catch-all */
export type ProductFamily = Exclude<ProductCategory, "all">;

/**
 * A product with no family (empty or unrecognised product type) only shows under `all`, so
 * a mislabelled product in Admin never disappears from the catalog — it just loses its filter.
 */
export function matchesCategory(
  family: ProductFamily | null,
  category: ProductCategory,
): boolean {
  return category === "all" || family === category;
}

/**
 * Shopify's free-text "Product type" field, mapped to a family. Keys are what
 * `normalizeProductType` produces: lower-case, trimmed, accents stripped — so "Chaquetas",
 * "chaqueta " and "CHAQUETA" all land on `jackets`. Spanish first (the merchant writes in
 * Spanish), English alongside. Add the store's own wording here when a type is missing.
 */
const PRODUCT_TYPE_ALIASES: Record<string, ProductFamily> = {
  chaqueta: "jackets",
  chaquetas: "jackets",
  jacket: "jackets",
  jackets: "jackets",

  top: "tops",
  tops: "tops",
  camiseta: "tops",
  camisetas: "tops",
  blusa: "tops",
  blusas: "tops",

  pantalon: "pants",
  pantalones: "pants",
  bermuda: "pants",
  bermudas: "pants",
  pants: "pants",

  "falda/vestido": "skirtsDresses",
  "faldas/vestidos": "skirtsDresses",
  "skirt/dress": "skirtsDresses",
  "skirts/dresses": "skirtsDresses",
  falda: "skirtsDresses",
  faldas: "skirtsDresses",
  vestido: "skirtsDresses",
  vestidos: "skirtsDresses",
  skirt: "skirtsDresses",
  skirts: "skirtsDresses",
  dress: "skirtsDresses",
  dresses: "skirtsDresses",

  accesorio: "accessories",
  accesorios: "accessories",
  medias: "accessories",
  accessory: "accessories",
  accessories: "accessories",
};

export function normalizeProductType(raw: string): string {
  return raw.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Whole string first, then each slash- or comma-separated part — so "falda/vestido" matches
 * either as its own alias or through "falda", and a type like "Top / Blusa" still resolves.
 */
export function familyFromProductType(
  raw: string | null | undefined,
): ProductFamily | null {
  if (!raw) return null;

  const whole = normalizeProductType(raw);
  const direct = PRODUCT_TYPE_ALIASES[whole];
  if (direct) return direct;

  for (const part of whole.split(/[/,]/)) {
    const family = PRODUCT_TYPE_ALIASES[part.trim()];
    if (family) return family;
  }

  return null;
}
