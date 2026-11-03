"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { TEXT_LINK_CLASS } from "@/components/ui/text-link";
import { SHOWCASE_ROWS, SHOWCASE_SLOTS } from "@/config/catalog-layout";
import {
  isLandscape,
  LANDSCAPE_MOBILE_MIN,
  type ProductCardItem,
  ProductMediaCard,
} from "@/features/products/product-media-card";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealOnScroll } from "@/lib/reveal-on-scroll";
import { cn } from "@/lib/utils/cn";

type ProductShowcaseSectionProps = {
  /** Any length: the composition repeats every `SHOWCASE_SLOTS.length` products */
  items: ProductCardItem[];
};

export function ProductShowcaseSection({ items }: ProductShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("home.showcase");

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Every card plus the "view all" link at the foot of the grid — they all reveal the
      // same way, each on its own position
      revealOnScroll(
        gsap.utils.toArray<HTMLElement>(
          "[data-product-card], [data-showcase-reveal]",
          section,
        ),
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="bg-surface px-3 py-20 sm:px-6 lg:px-10 xl:px-14"
    >
      {/* No max-width on desktop: the scattered grid is meant to span the full viewport */}
      <div className="mx-auto max-w-7xl md:max-w-none">
        <header className="mb-14 flex flex-col items-center justify-between gap-2 md:mb-20">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
            {t("eyebrow")}
          </p>
          <h2 className="font-wordmark text-xl font-medium uppercase tracking-[0.08em] text-text sm:text-xl">
            DuraMadre
          </h2>
        </header>

        <div className="flex flex-col gap-14 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-0 lg:gap-x-10">
          {items.map((item, index) => {
            const slot = SHOWCASE_SLOTS[index % SHOWCASE_SLOTS.length];
            const pass = Math.floor(index / SHOWCASE_SLOTS.length);
            return (
              <ProductMediaCard
                key={item.id}
                item={item}
                className={cn(
                  slot.mobile,
                  slot.desktop,
                  isLandscape(item) && LANDSCAPE_MOBILE_MIN,
                )}
                // Ignored on a phone, where the list is a flex column
                style={{ gridRowStart: slot.row + pass * SHOWCASE_ROWS }}
              />
            );
          })}
        </div>

        <div
          data-showcase-reveal
          className="mt-20 flex flex-col items-center gap-3 md:mt-28"
        >
          <Link
            href="/products"
            className={cn(TEXT_LINK_CLASS, "text-text hover:opacity-60")}
          >
            {/* Same dot the footer marks its active link with */}
            <span aria-hidden>·&nbsp;</span>
            {t("viewAll")}
            <span aria-hidden>&nbsp;·</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
