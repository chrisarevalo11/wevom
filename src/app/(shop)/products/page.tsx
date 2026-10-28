import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopifySetupNotice } from "@/components/ui/shopify-setup-notice";
import { isShopifyConfigured } from "@/env";
import { getCatalogItems } from "@/features/products/catalog";
import { CatalogBrowser } from "@/features/products/catalog-browser";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products.meta");
  return { title: t("title"), description: t("description") };
}

export default async function ProductsPage() {
  if (!isShopifyConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <ShopifySetupNotice />
      </div>
    );
  }

  const [t, items] = await Promise.all([
    getTranslations("products"),
    getCatalogItems(),
  ]);

  // The browser carries its own spacing: the two breakpoints lay out nothing alike
  return <CatalogBrowser items={items} emptyLabel={t("empty")} />;
}
