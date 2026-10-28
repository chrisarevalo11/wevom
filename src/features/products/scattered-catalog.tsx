"use client";

import { useRef } from "react";
import { CATALOG_SLOTS, ROWS_PER_CYCLE } from "@/config/catalog-layout";
import type { CatalogItem } from "@/features/products/catalog-browser";
import { ProductMediaCard } from "@/features/products/product-media-card";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { revealOnScroll } from "@/lib/reveal-on-scroll";

export function ScatteredCatalog({ items }: { items: CatalogItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      revealOnScroll(gsap.utils.toArray<HTMLElement>("[data-product-card]", root));

      // Filtering swaps the whole grid out from under the triggers, so their start/end
      // positions have to be measured again
      ScrollTrigger.refresh();
    },
    // `items` identity changes with the selected category, and revertOnUpdate tears the old
    // triggers down before the new cards are measured
    { scope: rootRef, dependencies: [items], revertOnUpdate: true },
  );

  return (
    // Tight gaps on both axes: the per-slot column placement is what lets cards reach the
    // viewport edges, and the per-slot top offsets carry the vertical rhythm — a large row
    // gap here would put every row back on a visible line
    <div
      ref={rootRef}
      className="flex flex-col md:grid md:grid-cols-12 md:gap-x-4 md:gap-y-6 lg:gap-x-6"
    >
      {items.map((item, index) => {
        const slot = CATALOG_SLOTS[index % CATALOG_SLOTS.length];
        const cycle = Math.floor(index / CATALOG_SLOTS.length);

        return (
          <div
            key={item.id}
            className={`${slot.mobile} ${slot.desktop}`}
            // Each pass through the slots starts a fresh band of rows. Ignored on mobile,
            // where the container is a plain flex column.
            style={{ gridRowStart: slot.row + cycle * ROWS_PER_CYCLE }}
          >
            <ProductMediaCard item={item} aspect={slot.aspect} />
          </div>
        );
      })}
    </div>
  );
}
