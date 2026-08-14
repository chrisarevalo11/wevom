import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SHOWCASE_PRODUCTS } from "@/config/showcase-products";
import { isShopifyConfigured } from "@/env";
import type { CatalogItem } from "@/features/products/catalog-product-card";
import { ScatteredCatalog } from "@/features/products/scattered-catalog";
import { getProducts, type ShopifyProductSummary } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils/format-price";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products.meta");

  return { title: t("title"), description: t("description") };
}

/** Enough cards to read as a catalog and to exercise the full slot cycle plus a repeat */
const PLACEHOLDER_COUNT = 20;

/**
 * Stands in until Shopify is wired, built by cycling the six products the home showcase
 * already renders — so the images repeat by design. Swap `getCatalogItems` to the Shopify
 * path and this disappears on its own.
 */
const LOCAL_ITEMS: CatalogItem[] = Array.from(
  { length: PLACEHOLDER_COUNT },
  (_, index) => {
    const product = SHOWCASE_PRODUCTS[index % SHOWCASE_PRODUCTS.length];

    return {
      // Index-suffixed: the same product appears several times and React needs stable,
      // unique keys for each card
      id: `${product.id}-${index}`,
      title: product.title,
      priceLabel: product.price,
      href: product.href,
      image: product.image,
    };
  },
);

function toCatalogItem(product: ShopifyProductSummary): CatalogItem {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;

  return {
    id: product.id,
    title: product.title,
    priceLabel: formatPrice(amount, currencyCode),
    href: `/products/${product.handle}`,
    // Products without a featured image still need a box to sit in
    image: product.featuredImage?.url ?? "/images/p1.png",
  };
}

async function getCatalogItems(): Promise<CatalogItem[]> {
  if (!isShopifyConfigured()) return LOCAL_ITEMS;

  try {
    const { products } = await getProducts(24);

    // An empty store should still show the collection rather than a bare page
    return products.length > 0 ? products.map(toCatalogItem) : LOCAL_ITEMS;
  } catch {
    return LOCAL_ITEMS;
  }
}

export default async function ProductsPage() {
  const [t, items] = await Promise.all([
    getTranslations("products"),
    getCatalogItems(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-24 sm:px-6 lg:px-8">
      <header className="mb-20 flex flex-col items-center gap-2 md:mb-28">
        <p className="font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
          {t("title")}
        </p>
        <h1 className="max-w-xl text-center font-sans text-sm leading-relaxed text-text-muted">
          {t("description")}
        </h1>
      </header>

      <ScatteredCatalog items={items} />
    </div>
  );
}
