"use client";

import { useRef } from "react";
import { CATALOG_SLOTS, ROWS_PER_CYCLE } from "@/config/catalog-layout";
import {
  type CatalogItem,
  CatalogProductCard,
} from "@/features/products/catalog-product-card";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function ScatteredCatalog({ items }: { items: CatalogItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-catalog-card]", root);
      const slots = gsap.utils.toArray<HTMLElement>("[data-catalog-slot]", root);
      if (cards.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(cards, { autoAlpha: 1 });
        return;
      }

      // One trigger per card so each fades on its own visibility rather than the grid's
      for (const card of cards) {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      /*
       * Parallax drift lives on the slot wrapper, never on the card: the reveal above already
       * owns the card's y, and two tweens fighting over one transform is a stutter.
       *
       * Desktop only — matchMedia reverts the tweens below md, where the single column is
       * already tall and drifting cards mostly fight the scroll.
       */
      gsap.matchMedia().add("(min-width: 768px)", () => {
        for (const [index, slot] of slots.entries()) {
          const { drift } = CATALOG_SLOTS[index % CATALOG_SLOTS.length];

          gsap.fromTo(
            slot,
            { y: drift },
            {
              y: -drift,
              ease: "none",
              scrollTrigger: {
                trigger: slot,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      });
    },
    { scope: rootRef, dependencies: [items.length], revertOnUpdate: true },
  );

  return (
    // gap-y-24 (96px) clears the widest parallax pair: two neighbouring rows drifting toward
    // each other close at most 68px, so the space between cards never collapses onto an image
    <div
      ref={rootRef}
      className="flex flex-col md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-24"
    >
      {items.map((item, index) => {
        const slot = CATALOG_SLOTS[index % CATALOG_SLOTS.length];
        const cycle = Math.floor(index / CATALOG_SLOTS.length);

        return (
          <div
            key={item.id}
            data-catalog-slot
            className={`${slot.mobile} ${slot.desktop}`}
            // Each pass through the slots starts a fresh band of rows. Ignored on mobile,
            // where the container is a plain flex column.
            style={{ gridRowStart: slot.row + cycle * ROWS_PER_CYCLE }}
          >
            <CatalogProductCard item={item} aspect={slot.aspect} />
          </div>
        );
      })}
    </div>
  );
}
