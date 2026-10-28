import "server-only";

import { isShopifyConfigured } from "@/env";
import type { Locale } from "@/i18n/locales";
import type {
  GetProductByHandleQuery,
  GetProductsQuery,
} from "../../../types/storefront.generated";
import { getShopifyClient } from "./client";
import { storefrontContext } from "./context";
import { getCartQuery, getProductByHandleQuery, getProductsQuery } from "./queries";

/*
 * Product shapes come straight from the generated query types (`bun run codegen`), so the
 * fetchers stay in step with the query text. Cart types are still hand-written: the cart
 * query reads `edges`, and the actions/drawer depend on this flattened shape.
 */
export type ProductNode = GetProductsQuery["products"]["nodes"][number];
export type ProductDetail = NonNullable<GetProductByHandleQuery["product"]>;

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    /** Units in stock, or null when the store does not track inventory for the variant */
    quantityAvailable: number | null;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
    price: { amount: string; currencyCode: string };
    image: ShopifyImage | null;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: ShopifyCartLine[];
};

/**
 * GraphQL can return data and errors together: a field the token has no scope for comes back
 * null with an error beside it. That is a warning, not a failure — only an empty response is.
 * Logs so a missing permission shows up in the server output instead of silently as `null`.
 */
function assertData<T>(
  data: T | undefined,
  errors: { message?: string; graphQLErrors?: unknown[] } | undefined,
  fallbackMessage: string,
): asserts data is T {
  if (errors && data !== undefined) {
    console.warn(
      `[shopify] ${fallbackMessage}:`,
      errors.graphQLErrors ?? errors.message,
    );
    return;
  }
  if (errors || data === undefined) {
    throw new Error(errors?.message ?? fallbackMessage);
  }
}

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super(
      "Shopify is not configured. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN to your .env file.",
    );
    this.name = "ShopifyNotConfiguredError";
  }
}

type GetProductsOptions = {
  first: number;
  after?: string;
  locale: Locale;
};

export async function getProducts({
  first,
  after,
  locale,
}: GetProductsOptions): Promise<{
  products: ProductNode[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getProductsQuery, {
    variables: { first, after, ...storefrontContext(locale) },
  });

  assertData(data, errors, "Failed to fetch products");

  return {
    products: data.products.nodes,
    pageInfo: {
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor ?? null,
    },
  };
}

export async function getProductByHandle(
  handle: string,
  locale: Locale,
): Promise<ProductDetail | null> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getProductByHandleQuery, {
    variables: { handle, ...storefrontContext(locale) },
  });

  assertData(data, errors, "Failed to fetch product");

  return data.product ?? null;
}

/**
 * How many a visitor may take. `quantityAvailable` is null when the token lacks the inventory
 * scope or the variant is not tracked, and zero or negative when the merchant sells past
 * stock — none of those should cap the stepper, so only a positive count is a limit.
 */
export function stockLimit(
  quantityAvailable: number | null | undefined,
): number | null {
  return typeof quantityAvailable === "number" && quantityAvailable > 0
    ? quantityAvailable
    : null;
}

/** The generated shape leaves optional fields `undefined`; the drawer expects `null` */
function toImage(
  image: { url: string; altText?: string | null } | null | undefined,
): ShopifyImage | null {
  return image ? { url: image.url, altText: image.altText ?? null } : null;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getCartQuery, {
    variables: { cartId },
  });

  assertData(data, errors, "Failed to fetch cart");

  if (!data.cart) return null;

  const { lines, ...cart } = data.cart;

  return {
    ...cart,
    lines: lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      merchandise: {
        id: node.merchandise.id,
        // Shopify names the lone variant of an option-less product "Default Title"
        title: node.merchandise.title === "Default Title" ? "" : node.merchandise.title,
        quantityAvailable: stockLimit(node.merchandise.quantityAvailable),
        product: {
          title: node.merchandise.product.title,
          handle: node.merchandise.product.handle,
          featuredImage: toImage(node.merchandise.product.featuredImage),
        },
        price: node.merchandise.price,
        image: toImage(node.merchandise.image),
      },
    })),
  };
}
