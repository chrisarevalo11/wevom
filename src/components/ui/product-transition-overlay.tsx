"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useProductTransitionStore } from "@/stores/product-transition-store";

/** Marks the image on the detail page that a card morphs into */
export const PRODUCT_HERO_ATTRIBUTE = "data-product-hero";
/** Marks the detail page's info panels, held back until the image has landed */
export const PRODUCT_INFO_ATTRIBUTE = "data-product-info";

const IMAGE_FADE_IN = 0.14;
/** The rest of the listing whitening out around the picked image */
const COVER_FADE_IN = 0.5;
/** How long the picked image floats on its own before it travels, counted from the click */
const HOLD = 1;
const MORPH_DURATION = 0.9;
const COVER_FADE_OUT = 0.4;
/** Gap between the image settling and the info starting to appear */
const INFO_DELAY = 0.3;
const INFO_FADE_IN = 0.6;

/** Give up and hand the page over plainly if the detail view takes this long to arrive */
const TARGET_TIMEOUT_MS = 1500;

/**
 * Carries a product image across the route change.
 *
 * Mounted once in the root layout, because it has to outlive both pages. The card hands over
 * its image and leaves the navigation to this overlay, which runs it in four beats:
 *
 * 1. the page whitens out around the image, which stays exactly where the card had it;
 * 2. once the white is opaque, the route changes underneath, unseen;
 * 3. after HOLD the image travels to the detail page's first image;
 * 4. INFO_DELAY after it lands, the product info fades in beside it.
 */
export function ProductTransitionOverlay() {
  const pending = useProductTransitionStore((state) => state.pending);
  const clear = useProductTransitionStore((state) => state.clear);
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const image = imageRef.current;
      const cover = coverRef.current;
      if (!pending || !image || !cover) return;

      /*
       * <html> has scroll-behavior: smooth, so the router's own scroll-to-top would glide
       * rather than jump — and still be travelling when the target is measured, leaving the
       * page to keep sliding under an image that has already landed. The overlay resets the
       * scroll itself, instantly, while the cover hides it.
       */
      const resetScroll = () =>
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      if (prefersReducedMotion()) {
        router.push(pending.href);
        clear();
        return;
      }

      gsap.set(image, { ...pending.from });
      // A quick fade rather than an instant swap: on desktop the card is under the pointer, so
      // what was on screen at the click is its hover shot, and this crossfades back to the one
      // the product page opens on
      gsap.fromTo(
        image,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: IMAGE_FADE_IN, ease: "power1.out" },
      );
      // Navigating only once the white is opaque is what keeps the page swap out of sight
      gsap.fromTo(
        cover,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: COVER_FADE_IN,
          ease: "power1.inOut",
          onComplete: () => {
            router.push(pending.href, { scroll: false });
            resetScroll();
          },
        },
      );

      let frame = 0;

      // Nothing may scroll the page while the image is travelling to a measured position
      const blockScroll = (event: Event) => event.preventDefault();
      window.addEventListener("wheel", blockScroll, { passive: false });
      window.addEventListener("touchmove", blockScroll, { passive: false });
      const unblockScroll = () => {
        window.removeEventListener("wheel", blockScroll);
        window.removeEventListener("touchmove", blockScroll);
      };

      /** Lets the parked info panels in, then hands the page back */
      const finish = () => {
        const info = document.querySelectorAll(`[${PRODUCT_INFO_ATTRIBUTE}]`);
        // Set inline before clear() drops the `invisible` class, so the panels never pop in
        gsap.set(info, { autoAlpha: 0 });
        unblockScroll();
        clear();
        gsap.to(info, {
          autoAlpha: 1,
          duration: INFO_FADE_IN,
          delay: INFO_DELAY,
          ease: "power2.out",
        });
      };

      const morphTo = (target: Element) => {
        // Again here: the new page may have restored or nudged the scroll since the push.
        // Reading the rect right after is a synchronous layout, so it sees the top of the page
        resetScroll();
        const to = target.getBoundingClientRect();

        gsap
          .timeline({ onComplete: finish })
          .to(image, {
            top: to.top,
            left: to.left,
            width: to.width,
            height: to.height,
            duration: MORPH_DURATION,
            ease: "power3.inOut",
          })
          // Clears as the image settles, so the header is back by the time it lands. The
          // detail page underneath is blank but for the header — its first image and info
          // are both still held back
          .to(
            cover,
            { autoAlpha: 0, duration: COVER_FADE_OUT, ease: "power2.out" },
            MORPH_DURATION - COVER_FADE_OUT,
          );
      };

      /*
       * The detail page is a server component, so there is no telling which frame it lands on.
       * Watch for its hero instead of guessing — and wait for the hero's own image to have
       * decoded, or the morph would finish onto an empty box.
       */
      const look = (deadline: number) => {
        const target = document.querySelector(`[${PRODUCT_HERO_ATTRIBUTE}]`);
        const targetImage = target?.querySelector("img");

        if (target && targetImage?.complete && target.clientHeight > 0) {
          morphTo(target);
          return;
        }

        if (performance.now() > deadline) {
          finish();
          return;
        }

        frame = requestAnimationFrame(() => look(deadline));
      };

      gsap.delayedCall(HOLD, () => look(performance.now() + TARGET_TIMEOUT_MS));

      return () => {
        cancelAnimationFrame(frame);
        unblockScroll();
      };
    },
    { dependencies: [pending, clear, router] },
  );

  if (!pending) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[95]">
      {/* The page's own colour, so the route swapping underneath is never seen */}
      <div ref={coverRef} className="absolute inset-0 bg-surface opacity-0" />

      {/*
       * A plain img, not next/image: it is positioned and resized by GSAP every frame, and its
       * src is the already-cached URL the card was showing. object-cover all the way through
       * means the crop resolves itself — the card's box is cropped, the hero's is not, and the
       * image re-fits as it travels between them.
       */}
      {/* biome-ignore lint/performance/noImgElement: the src is the optimized URL the card already loaded */}
      <img
        ref={imageRef}
        src={pending.src}
        alt=""
        aria-hidden
        className="invisible absolute object-cover"
      />
    </div>,
    document.body,
  );
}
