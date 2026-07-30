import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import type { ShopifyProductSummary } from "@/lib/shopify";

type ProductCardProps = {
  product: ShopifyProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-medium">{product.title}</h3>
        <Price
          amount={product.priceRange.minVariantPrice.amount}
          currencyCode={product.priceRange.minVariantPrice.currencyCode}
          className="text-text-muted"
        />
      </div>
    </Link>
  );
}
