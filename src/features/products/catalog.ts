import "server-only";

import { unstable_cache } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { cache } from "react";
import { SHOWCASE_SLOTS } from "@/config/catalog-layout";
import { familyFromProductType } from "@/config/product-categories";
import { isShopifyConfigured } from "@/env";
import type { CatalogItem } from "@/features/products/catalog-browser";
import type { ProductDetailView } from "@/features/products/product-detail";
import { productHref } from "@/features/products/product-href";
import type { ProductCardItem } from "@/features/products/product-media-card";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import {
  getCollectionProducts,
  getProductByHandle,
  getProducts,
  type ProductDetail,
  type ProductNode,
  stockLimit,
} from "@/lib/shopify";
import { formatPrice, priceLocale } from "@/lib/utils/format-price";

/*
 * The one place Shopify products become what the pages render. Pages call the three
 * `get*` functions below and never see a Storefront shape; the home showcase, the catalog
 * and the detail page therefore share one mapping, one cache and one locale rule.
 */

/** The fallback showcase: one pass of the composition, filled with the newest products */
export const SHOWCASE_FALLBACK_COUNT = SHOWCASE_SLOTS.length;

/** Plenty for the current range; paginate once the store outgrows it */
const CATALOG_COUNT = 48;
/** The option Shopify fabricates (value "Default Title") when a product has no options */
const DEFAULT_OPTION_NAME = "Title";

/**
 * The collection the merchant curates for the home: Shopify's default "Home page" collection,
 * whose handle is fixed. Edited in Admin under Products → Collections; its order is the order
 * on the page. Until it exists the showcase falls back to the newest products.
 */
const SHOWCASE_COLLECTION_HANDLE = "frontpage";

/** Products without a single image still need a box to sit in */
const FALLBACK_IMAGE = "/images/p1.png";

const PRODUCTS_TAG = "products";
const REVALIDATE_SECONDS = 60;

/*
 * Only the Storefront call is cached — the locale cookie keeps every page dynamic. Locale is
 * part of the key because `@inContext` changes the response. Tags make a later webhook
 * (`revalidateTag("products")`) enough to flush everything.
 */
const cachedProducts = unstable_cache(
  (first: number, locale: Locale) => getProducts({ first, locale }),
  ["shopify-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS },
);

const cachedShowcaseCollection = unstable_cache(
  (locale: Locale) =>
    getCollectionProducts(SHOWCASE_COLLECTION_HANDLE, CATALOG_COUNT, locale),
  ["shopify-showcase-collection"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS },
);

function cachedProduct(handle: string, locale: Locale) {
  return unstable_cache(
    () => getProductByHandle(handle, locale),
    ["shopify-product", handle, locale],
    { tags: [PRODUCTS_TAG, `product:${handle}`], revalidate: REVALIDATE_SECONDS },
  )();
}

async function currentLocale(): Promise<Locale> {
  const locale = await getLocale();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

function reportError(context: string, error: unknown) {
  // Surface the Storefront failure in the server log; the page itself degrades to empty
  console.error(`[shopify] ${context}:`, error);
}

function toCardItem(product: ProductNode, locale: Locale): ProductCardItem {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;
  const [first, second] = product.images.nodes;
  const image = first?.url ?? FALLBACK_IMAGE;

  return {
    id: product.id,
    href: productHref(product.handle),
    title: product.title,
    price: formatPrice(amount, currencyCode, priceLocale(locale)),
    image,
    // The second shot is the hover frame; with only one, the crossfade lands on the same image
    hoverImage: second?.url ?? image,
    // Cards keep the photo's own proportions, so nothing is cropped into a shape it was not shot in
    aspectRatio: first?.width && first?.height ? first.width / first.height : null,
  };
}

function toCatalogItem(product: ProductNode, locale: Locale): CatalogItem {
  return {
    ...toCardItem(product, locale),
    category: familyFromProductType(product.productType),
  };
}

/**
 * The home picks: every product of the curated collection when it has any, otherwise the
 * newest eight so the home is never empty.
 */
export async function getShowcaseItems(): Promise<ProductCardItem[]> {
  if (!isShopifyConfigured()) return [];

  const locale = await currentLocale();

  try {
    const curated = await cachedShowcaseCollection(locale);
    const products =
      curated && curated.length > 0
        ? curated
        : (await cachedProducts(SHOWCASE_FALLBACK_COUNT, locale)).products;
    return products.map((product) => toCardItem(product, locale));
  } catch (error) {
    reportError("showcase", error);
    return [];
  }
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
  if (!isShopifyConfigured()) return [];

  const locale = await currentLocale();

  try {
    const { products } = await cachedProducts(CATALOG_COUNT, locale);
    return products.map((product) => toCatalogItem(product, locale));
  } catch (error) {
    reportError("catalog", error);
    return [];
  }
}

/** The copy Shopify doesn't carry yet — metafields are the next step for these */
type SampleCopy = { description: string; composition: string; care: string };

async function getSampleCopy(): Promise<SampleCopy> {
  const t = await getTranslations("product.sample");
  return {
    description: t("description"),
    composition: t("composition"),
    care: t("care"),
  };
}

function toDetailView(
  product: ProductDetail,
  copy: SampleCopy,
  locale: Locale,
): ProductDetailView {
  const variants = product.variants.nodes;
  const variant = variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;

  /*
   * Every real option becomes a selector row (size, colour, ...). Shopify gives an option-less
   * product a single "Title" option whose only value is "Default Title"; that one is dropped so
   * the page shows nothing to pick. Variants keep their full option combination so the buy
   * button adds exactly the one the visitor composed.
   */
  const options = product.options
    .filter((entry) => entry.name !== DEFAULT_OPTION_NAME)
    .map((entry) => ({
      name: entry.name,
      values: entry.optionValues.map((value) => value.name),
    }));
  const variantViews = variants.map((candidate) => ({
    id: candidate.id,
    available: candidate.availableForSale,
    maxQuantity: stockLimit(candidate.quantityAvailable),
    selectedOptions: Object.fromEntries(
      candidate.selectedOptions
        .filter((selected) => selected.name !== DEFAULT_OPTION_NAME)
        .map((selected) => [selected.name, selected.value]),
    ),
  }));

  const images =
    product.images.nodes.length > 0
      ? product.images.nodes
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  return {
    title: product.title,
    price: formatPrice(price.amount, price.currencyCode, priceLocale(locale)),
    ...copy,
    // The store's own description wins over the placeholder line
    description: product.description || copy.description,
    options,
    variants: variantViews,
    images: images.map((image) => ({
      src: image.url,
      alt: image.altText ?? product.title,
    })),
  };
}

/**
 * Deduplicated per request with React `cache`, so `generateMetadata` and the page share one
 * Storefront call. `null` for an unknown handle, an unconfigured store, or a failed request.
 */
export const getProductView = cache(
  async (handle: string): Promise<ProductDetailView | null> => {
    if (!isShopifyConfigured()) return null;

    const locale = await currentLocale();

    try {
      const [product, copy] = await Promise.all([
        cachedProduct(handle, locale),
        getSampleCopy(),
      ]);
      return product ? toDetailView(product, copy, locale) : null;
    } catch (error) {
      reportError(`product ${handle}`, error);
      return null;
    }
  },
);
