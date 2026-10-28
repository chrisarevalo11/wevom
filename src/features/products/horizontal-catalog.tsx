"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FooterBody } from "@/components/layout/footer";
import {
  CATALOG_RAIL_SLOTS,
  RAIL_LEAD_IN,
  RAIL_TRACK_LEAD,
  RAIL_TRACK_LEAD_UNDO,
  RAIL_TRACK_TAIL,
} from "@/config/catalog-layout";
import type { CatalogItem } from "@/features/products/catalog-browser";
import { ProductMediaCard } from "@/features/products/product-media-card";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

type HorizontalCatalogProps = {
  items: CatalogItem[];
  /** The category column. Owned by the browser above, so it arrives as a node */
  filter: ReactNode;
  emptyLabel: string;
};

/**
 * The desktop catalog: one screen tall, pinned in place while the wheel drives the cards
 * sideways past it, and ending on the footer — which is the last panel of the track rather
 * than something below it, so this whole route scrolls in one direction.
 *
 * The column of categories sits outside the moving track, so it holds still for the whole
 * traverse; the pin is what makes it stick, no sticky positioning needed. Cards cross behind
 * both it and the navbar, both of which blend in difference mode, so an image passing under
 * them inverts the text rather than burying it.
 */
export function HorizontalCatalog({
  items,
  filter,
  emptyLabel,
}: HorizontalCatalogProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isReduced, setIsReduced] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // Read once on the client: it decides whether the rail is a GSAP-driven pin or a plain
  // scrollable strip, which is markup, not just a tween
  useEffect(() => setIsReduced(prefersReducedMotion()), []);

  /*
   * Where the visitor was before a category switch. Changing `items` rebuilds the pin, and
   * tearing the old one down shrinks the page for a moment — the browser clamps the scroll
   * and the rail snaps back to its start. Declared before `useGSAP` so this cleanup runs
   * first, while the old pin still holds the page at its full height.
   */
  const savedScrollY = useRef<number | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `items` is the trigger, not an input — the cleanup must run on every catalog change
  useLayoutEffect(() => {
    return () => {
      savedScrollY.current = window.scrollY;
    };
  }, [items]);

  const restoreScroll = (maxY: number) => {
    const y = savedScrollY.current;
    if (y === null) return;
    savedScrollY.current = null;
    // No further than the new end: a shorter category must not leave the page scrolled
    // into empty space past the footer
    window.scrollTo(0, Math.min(y, maxY));
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-product-card]", track);

      if (isReduced) {
        gsap.set(cards, { autoAlpha: 1 });
        return;
      }

      // Below lg the stacked catalog is what's on screen and this section is display:none,
      // where every measurement would come back zero
      gsap.matchMedia().add(DESKTOP_QUERY, () => {
        // Re-read on every refresh rather than captured once: the track is sized in vw, so a
        // resized window changes how far it has to travel
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        if (distance() === 0) {
          gsap.set(cards, { autoAlpha: 1 });
          // Nothing to pin, so the section's own top is as far as the page goes
          restoreScroll(section.getBoundingClientRect().top + window.scrollY);
          return;
        }

        const travel = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // The page grows by exactly the distance the track moves, so one wheel notch
            // covers the same ground here as it does anywhere else on the page
            end: () => `+=${distance()}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // The trigger pins and measures on creation, so its end is already the new page end
        restoreScroll(travel.scrollTrigger?.end ?? Number.POSITIVE_INFINITY);

        /*
         * The same scrubbed fade the rest of the site reveals cards with, except the cards
         * never move down the page — containerAnimation hands ScrollTrigger the horizontal
         * tween to measure against, so "left 95%" means 95% of the way across the viewport.
         */
        for (const card of cards) {
          gsap.fromTo(
            card,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: travel,
                start: "left 95%",
                end: "left 72%",
                scrub: true,
              },
            },
          );
        }

        // The footer panel carries its own links in the same corner the category column
        // stands in, so the column clears out as it arrives
        const footer = footerRef.current;
        if (footer && filterRef.current) {
          gsap.to(filterRef.current, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              containerAnimation: travel,
              start: "left 85%",
              end: "left 45%",
              scrub: true,
            },
          });
        }
      });
    },
    {
      scope: sectionRef,
      dependencies: [items, isReduced, isDesktop],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        /*
         * The background is not decoration — it is what makes the difference blending below
         * work at all. Pinning puts this section in its own stacking context, and a blend
         * inside a group whose backdrop is transparent is a no-op: white copy stays white,
         * black stays black, nothing ever inverts. Painting the page's own colour here gives
         * the blend something to subtract from, so the categories read normally over the page
         * and flip over a card crossing behind them.
         *
         * Deliberately not `isolate`: that would also seal the cards off from the navbar
         * above, which blends against them the same way.
         */
        "relative hidden h-dvh bg-surface lg:block",
        RAIL_LEAD_IN,
        // Under reduced motion nothing is pinned, so the strip is scrolled by hand instead
        isReduced ? "overflow-x-auto" : "overflow-hidden",
      )}
    >
      <div ref={trackRef} className={cn("flex h-full items-start", RAIL_TRACK_LEAD)}>
        {items.length > 0 ? (
          items.map((item, index) => {
            const slot = CATALOG_RAIL_SLOTS[index % CATALOG_RAIL_SLOTS.length];

            return (
              <div
                key={item.id}
                className={cn("shrink-0", slot.width, slot.gap, slot.place)}
              >
                <ProductMediaCard item={item} aspect={slot.aspect} />
              </div>
            );
          })
        ) : (
          /*
           * A full viewport wide and pulled back over the lead, so the line sits at the true
           * centre of the screen and the footer panel that follows starts off-screen.
           */
          <p
            className={cn(
              "flex h-full w-dvw shrink-0 items-center justify-center text-center font-sans text-xs uppercase tracking-[0.24em] text-text-muted",
              RAIL_TRACK_LEAD_UNDO,
            )}
          >
            {emptyLabel}
          </p>
        )}

        {/*
         * The end of the route, reached sideways. Mounted only on desktop — the page's own
         * footer is the one that renders everywhere else, and two of them would mean two
         * WebGL bodies.
         */}
        {isDesktop ? (
          <div
            ref={footerRef}
            data-footer
            className={cn("relative h-full w-screen shrink-0", RAIL_TRACK_TAIL)}
          >
            <FooterBody />
          </div>
        ) : null}
      </div>

      {/*
       * Outside the track so the pin holds it still, and painted white under difference
       * blending the way the navbar is: subtracted from the surface it sits on it lands back
       * on the ordinary near-black, and a card crossing underneath flips it.
       *
       * This only works because the section above carries `isolate bg-surface` — see there.
       */}
      <div
        ref={filterRef}
        className="absolute left-6 top-0 bottom-0 z-20 py-[14vh] mix-blend-difference xl:left-10"
      >
        {filter}
      </div>
    </section>
  );
}
