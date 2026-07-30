import { BRAND_NAME } from "@/config/brand";

export const siteConfig = {
  name: BRAND_NAME,
  description: "Premium products crafted for everyday excellence.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
] as const;

export const SHOPIFY_CART_COOKIE = "shopify_cart_id";
