import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopifySetupNotice } from "@/components/ui/shopify-setup-notice";
import { isShopifyConfigured } from "@/env";
import { CheckoutSummary } from "@/features/checkout/checkout-summary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("summary.meta");
  return { title: t("title"), description: t("description") };
}

export default function SummaryPage() {
  if (!isShopifyConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <ShopifySetupNotice />
      </div>
    );
  }

  // The cart lives client-side (TanStack Query over the cookie-bound cart), so the page itself
  // has nothing to fetch
  return <CheckoutSummary />;
}
