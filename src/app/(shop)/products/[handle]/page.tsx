import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopifySetupNotice } from "@/components/ui/shopify-setup-notice";
import { getSiteUrl, isShopifyConfigured } from "@/env";
import {
  ProductGallery,
  ProductPurchasePanel,
} from "@/features/products/product-detail";
import { getProductByHandle, ShopifyNotConfiguredError } from "@/lib/shopify";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;

  if (!isShopifyConfigured()) {
    return { title: "Product" };
  }

  try {
    const product = await getProductByHandle(handle);
    if (!product) return { title: "Product not found" };

    return {
      title: product.title,
      description: product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        url: `${getSiteUrl()}/products/${handle}`,
        images: product.featuredImage ? [{ url: product.featuredImage.url }] : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  if (!isShopifyConfigured()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <ShopifySetupNotice />
      </div>
    );
  }

  try {
    const product = await getProductByHandle(handle);
    if (!product) notFound();

    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery product={product} />
          <ProductPurchasePanel product={product} />
        </div>
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
