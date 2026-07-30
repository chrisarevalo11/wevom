import type { Metadata } from "next";
import { ShopifySetupNotice } from "@/components/ui/shopify-setup-notice";
import { isShopifyConfigured } from "@/env";
import { ProductCard } from "@/features/products/product-card";
import { getProducts, ShopifyNotConfiguredError } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our full product catalog.",
};

export default async function ProductsPage() {
  if (!isShopifyConfigured()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
        <div className="mt-8">
          <ShopifySetupNotice />
        </div>
      </div>
    );
  }

  try {
    const { products } = await getProducts(24);

    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
          <p className="mt-4 text-text-muted">
            Explore the full collection of products available in your store.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-text-muted">No products found in your store.</p>
        )}
      </div>
    );
  } catch (error) {
    if (error instanceof ShopifyNotConfiguredError) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <ShopifySetupNotice />
        </div>
      );
    }

    throw error;
  }
}
