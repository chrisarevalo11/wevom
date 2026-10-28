import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSiteUrl } from "@/env";
import { getProductView } from "@/features/products/catalog";
import { ProductDetail } from "@/features/products/product-detail";
import { productHref } from "@/features/products/product-href";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [{ handle }, t] = await Promise.all([params, getTranslations("product.meta")]);
  const product = await getProductView(handle);

  if (!product) return { title: t("notFoundTitle") };

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${getSiteUrl()}${productHref(handle)}`,
      images: product.images[0] ? [{ url: product.images[0].src }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductView(handle);

  if (!product) notFound();

  // No page padding: the gallery runs edge to edge, and the panel carries its own
  return <ProductDetail product={product} />;
}
