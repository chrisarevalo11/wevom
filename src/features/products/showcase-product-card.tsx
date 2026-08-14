"use client";

import Image from "next/image";
import type { ShowcaseProduct } from "@/config/showcase-products";
import { cn } from "@/lib/utils/cn";
import { useComingSoonStore } from "@/stores/coming-soon-store";

type ShowcaseProductCardProps = {
  product: ShowcaseProduct;
  className?: string;
};

export function ShowcaseProductCard({ product, className }: ShowcaseProductCardProps) {
  const openComingSoon = useComingSoonStore((state) => state.open);

  return (
    <article data-showcase-card className={cn("flex flex-col", className)}>
      {/*
       * A button rather than a link to the product page: nothing can be bought yet, so the
       * card raises the "coming soon" modal instead of navigating.
       */}
      <button
        type="button"
        onClick={openComingSoon}
        className="group flex flex-col gap-3 text-left cursor-pointer"
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-surface-muted",
            product.imageAspect,
          )}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text sm:text-sm">
            {product.title}
          </h3>
          <p className="font-sans text-xs tracking-wide text-text-muted">
            {product.price}
          </p>
        </div>
      </button>
    </article>
  );
}
