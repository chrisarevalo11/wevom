import { BRAND_NAME } from "@/config/brand";

export const siteConfig = {
  name: BRAND_NAME,
  // Translated copy lives in messages/*.json under `site.description`; this stays only as
  // the value for contexts that render before a locale is resolved
  description: "Premium products crafted for everyday excellence.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const SHOPIFY_CART_COOKIE = "shopify_cart_id";
