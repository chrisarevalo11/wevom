"use client";

import Link from "next/link";

export function ShopifySetupNotice() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
      <p className="font-medium">Shopify is not configured yet</p>
      <p className="mt-2">
        Add <code className="rounded bg-white px-1">SHOPIFY_STORE_DOMAIN</code> and{" "}
        <code className="rounded bg-white px-1">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code>{" "}
        to your <code className="rounded bg-white px-1">.env</code> file. See{" "}
        <code className="rounded bg-white px-1">.env.example</code> for details.
      </p>
      <Link
        href="/products"
        className="mt-4 inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
      >
        View products page
      </Link>
    </div>
  );
}
