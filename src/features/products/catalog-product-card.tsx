"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { useComingSoonStore } from "@/stores/coming-soon-store";

/**
 * Whatever the catalog is fed from — the local config today, Shopify once it is wired — gets
 * normalised to this before it reaches the layout.
 */
export type CatalogItem = {
  id: string;
  title: string;
  priceLabel: string;
  href: string;
  image: string;
};

type CatalogProductCardProps = {
  item: CatalogItem;
  /** Comes from the slot, not the product: the same item reads at a different size here */
  aspect: string;
  className?: string;
};

export function CatalogProductCard({
  item,
  aspect,
  className,
}: CatalogProductCardProps) {
  const openComingSoon = useComingSoonStore((state) => state.open);

  return (
    <article data-catalog-card className={cn("flex flex-col", className)}>
      {/* Same reasoning as the showcase card: no purchase path yet, so it opens the modal */}
      <button
        type="button"
        onClick={openComingSoon}
        className="group flex flex-col gap-3 text-left cursor-pointer"
      >
        <div className={cn("relative w-full overflow-hidden bg-surface-muted", aspect)}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 33vw"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text sm:text-sm">
            {item.title}
          </h3>
          <p className="font-sans text-xs tracking-wide text-text-muted">
            {item.priceLabel}
          </p>
        </div>
      </button>
    </article>
  );
}
