"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useProductTransitionStore } from "@/stores/product-transition-store";

/**
 * Whatever a card is fed from — the local config today, Shopify once it is wired — gets
 * normalised to this before it reaches a layout.
 */
export type ProductCardItem = {
  id: string;
  /** The product page this card opens */
  href: string;
  title: string;
  price: string;
  image: string;
  /**
   * Shown on hover in place of `image`. Stands in for a second angle of the same garment
   * until Shopify supplies the real alternate shot — for now it borrows another product's.
   */
  hoverImage: string;
};

type ProductMediaCardProps = {
  item: ProductCardItem;
  /** Comes from the slot, not the product: the same item reads at a different size per layout */
  aspect: string;
  className?: string;
};

/** The single product card: the home showcase and the catalog both render this one. */
export function ProductMediaCard({ item, aspect, className }: ProductMediaCardProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const startTransition = useProductTransitionStore((state) => state.start);

  /**
   * Hands this card's image to the detail page instead of navigating. The overlay holds the
   * image in place while the page whitens out, and only routes once that cover is opaque. The
   * first img in the frame is the one the product page opens on — on desktop the hover shot
   * may be what's showing, and the overlay crossfades back to this one as it takes over.
   */
  const onNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    // A modifier click opens a tab and never leaves this page, so there is nothing to carry
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const frame = frameRef.current;
    const image = frame?.querySelector("img");
    if (!frame || !image) return;

    event.preventDefault();

    const { top, left, width, height } = frame.getBoundingClientRect();

    startTransition({
      href: item.href,
      src: image.currentSrc || image.src,
      from: { top, left, width, height },
    });
  };

  return (
    <article data-product-card className={cn("flex flex-col", className)}>
      <Link
        href={item.href}
        onClick={onNavigate}
        className="group flex flex-col gap-3 text-left"
      >
        <div
          ref={frameRef}
          className={cn("relative w-full overflow-hidden bg-surface-muted", aspect)}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
          />
          {/*
           * Crossfades in over the first on hover — a second look at the garment rather
           * than a zoom. Decorative: the card is already named by the first image's alt.
           */}
          <Image
            src={item.hoverImage}
            alt=""
            aria-hidden
            fill
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text sm:text-sm">
            {item.title}
          </h3>
          <p className="font-sans text-xs tracking-wide text-text-muted">
            {item.price}
          </p>
        </div>
      </Link>
    </article>
  );
}
