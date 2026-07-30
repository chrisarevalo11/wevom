import "server-only";

import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env, isShopifyConfigured } from "@/env";

export function getShopifyClient() {
  const storeDomain = env.SHOPIFY_STORE_DOMAIN;
  const publicAccessToken = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!isShopifyConfigured() || !storeDomain || !publicAccessToken) {
    throw new Error(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in your .env file.",
    );
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion: env.SHOPIFY_API_VERSION,
    publicAccessToken,
  });
}
