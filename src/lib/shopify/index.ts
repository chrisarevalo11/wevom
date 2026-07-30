import "server-only";

import { isShopifyConfigured } from "@/env";
import { getShopifyClient } from "./client";
import { getCartQuery, getProductByHandleQuery, getProductsQuery } from "./queries";

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ShopifyProductSummary = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

export type ShopifyProduct = ShopifyProductSummary & {
  descriptionHtml: string;
  images: ShopifyImage[];
  options: Array<{ name: string; values: string[] }>;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: Array<{ name: string; value: string }>;
    price: { amount: string; currencyCode: string };
    image: ShopifyImage | null;
  }>;
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
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

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super(
      "Shopify is not configured. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN to your .env file.",
    );
    this.name = "ShopifyNotConfiguredError";
  }
}

export async function getProducts(
  first = 12,
  after?: string,
): Promise<{
  products: ShopifyProductSummary[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getProductsQuery, {
    variables: { first, after },
  });

  if (errors) {
    throw new Error(errors.message ?? "Failed to fetch products");
  }

  const products =
    data?.products.edges.map((edge: { node: ShopifyProductSummary }) => edge.node) ??
    [];

  return {
    products,
    pageInfo: data?.products.pageInfo ?? {
      hasNextPage: false,
      endCursor: null,
    },
  };
}

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getProductByHandleQuery, {
    variables: { handle },
  });

  if (errors) {
    throw new Error(errors.message ?? "Failed to fetch product");
  }

  if (!data?.product) return null;

  const product = data.product;

  return {
    ...product,
    images:
      product.images?.edges.map((edge: { node: ShopifyImage }) => edge.node) ?? [],
    variants:
      product.variants?.edges.map(
        (edge: { node: ShopifyProduct["variants"][number] }) => edge.node,
      ) ?? [],
  } satisfies ShopifyProduct;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured()) {
    throw new ShopifyNotConfiguredError();
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request(getCartQuery, {
    variables: { cartId },
  });

  if (errors) {
    throw new Error(errors.message ?? "Failed to fetch cart");
  }

  if (!data?.cart) return null;

  return {
    ...data.cart,
    lines:
      data.cart.lines?.edges.map((edge: { node: ShopifyCartLine }) => edge.node) ?? [],
  } satisfies ShopifyCart;
}
