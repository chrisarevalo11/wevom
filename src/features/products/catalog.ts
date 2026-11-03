import "server-only";

import { unstable_cache } from "next/cache";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { SHOWCASE_SLOTS } from "@/config/catalog-layout";
import { familyFromProductType } from "@/config/product-categories";
import { isShopifyConfigured } from "@/env";
import type { CatalogItem } from "@/features/products/catalog-browser";
import type {
  ProductDetailView,
  ProductMedia,
} from "@/features/products/product-detail";
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
import { cleanRichText } from "@/lib/utils/rich-text";

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
/**
 * The collection the merchant orders by hand for the products page ("all products" in Admin).
 * While it is missing or empty the page lists every product, newest first.
 */
const CATALOG_COLLECTION_HANDLE = "all-products";

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

/** A curated collection, in the order the merchant arranged it; null when it does not exist */
function cachedCollection(handle: string, locale: Locale) {
  return unstable_cache(
    () => getCollectionProducts(handle, CATALOG_COUNT, locale),
    ["shopify-collection", handle, locale],
    { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

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
    const curated = await cachedCollection(SHOWCASE_COLLECTION_HANDLE, locale);
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
    const curated = await cachedCollection(CATALOG_COLLECTION_HANDLE, locale);
    const products =
      curated && curated.length > 0
        ? curated
        : (await cachedProducts(CATALOG_COUNT, locale)).products;
    return products.map((product) => toCatalogItem(product, locale));
  } catch (error) {
    reportError("catalog", error);
    return [];
  }
}

/**
 * Shopify renders every video at several sizes. 720p is the one to play: sharp on any product
 * column, a third the weight of 1080p. The rest follow in order of closeness, for browsers that
 * cannot play the first.
 */
const PREFERRED_VIDEO_HEIGHT = 1238;
function videoPreference(height: number | null | undefined): number {
  return Math.abs((height ?? 0) - PREFERRED_VIDEO_HEIGHT);
}

function toDetailView(product: ProductDetail, locale: Locale): ProductDetailView {
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
      values: entry.optionValues.map((value) => ({
        name: value.name,
        // Set in Admin when the option is linked to the colour category metafield
        color: value.swatch?.color ?? null,
      })),
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

  const media = product.media.nodes.flatMap((entry): ProductMedia[] => {
    if (entry.__typename === "MediaImage" && entry.image) {
      return [
        {
          kind: "image",
          src: entry.image.url,
          alt: entry.image.altText ?? product.title,
        },
      ];
    }
    if (entry.__typename === "Video") {
      const sources = entry.sources
        .filter((source) => source.mimeType === "video/mp4")
        .sort((a, b) => videoPreference(a.height) - videoPreference(b.height))
        .map((source) => ({ src: source.url, type: source.mimeType }));
      if (sources.length === 0) return [];
      return [
        {
          kind: "video",
          sources,
          poster: entry.previewImage?.url ?? null,
          alt: entry.alt || product.title,
        },
      ];
    }
    return [];
  });
  if (media.length === 0 && product.featuredImage) {
    media.push({
      kind: "image",
      src: product.featuredImage.url,
      alt: product.featuredImage.altText ?? product.title,
    });
  }

  return {
    title: product.title,
    price: formatPrice(price.amount, price.currencyCode, priceLocale(locale)),
    description: product.description,
    // Written in Admin's editor; rendered as it is there, in the site's own type
    descriptionHtml: cleanRichText(product.descriptionHtml),
    options,
    variants: variantViews,
    media,
    images: media.flatMap((entry) =>
      entry.kind === "image" ? [{ src: entry.src, alt: entry.alt }] : [],
    ),
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
      const product = await cachedProduct(handle, locale);
      return product ? toDetailView(product, locale) : null;
    } catch (error) {
      reportError(`product ${handle}`, error);
      return null;
    }
  },
);
