"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { SHOWCASE_PRODUCTS } from "@/config/showcase-products";
import { ShowcaseProductCard } from "@/features/products/showcase-product-card";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function ProductShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("home.showcase");

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-showcase-card]", section);
      if (cards.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(cards, { autoAlpha: 1 });
        return;
      }

      // One trigger per card so each fades on its own visibility, not the grid's
      for (const card of cards) {
        gsap.fromTo(
          card,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              // Reverses on scroll-up once the card leaves the viewport again
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-surface px-3 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 flex flex-col items-center justify-between gap-2 md:mb-20">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
            {t("eyebrow")}
          </p>
          <h2 className="font-wordmark text-xl font-medium uppercase tracking-[0.08em] text-text sm:text-xl">
            DuraMadre
          </h2>
        </header>

        <div className="flex flex-col gap-14 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-0">
          {SHOWCASE_PRODUCTS.map((product) => (
            <ShowcaseProductCard
              key={product.id}
              product={product}
              className={`${product.mobileClass} ${product.desktopClass}`}
            />
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-3 md:mt-28">
          <Link
            href="/products"
            className="font-sans text-xs uppercase tracking-[0.28em] text-text transition hover:opacity-60"
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
