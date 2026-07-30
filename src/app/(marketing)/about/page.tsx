import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${siteConfig.name} and our mission.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-accent">
        About us
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        Crafting products with purpose
      </h1>
      <div className="mt-8 space-y-6 text-text-muted">
        <p>
          {siteConfig.name} is a headless Shopify storefront built for brands that want
          full control over design, performance, and customer experience without
          sacrificing commerce reliability.
        </p>
        <p>
          Our catalog, inventory, and checkout are powered by Shopify, while the
          frontend delivers a fast, animated, and SEO-friendly experience using Next.js.
        </p>
        <p>
          Every product is selected and presented with care, reflecting our commitment
          to quality, transparency, and long-term value.
        </p>
      </div>
    </div>
  );
}
