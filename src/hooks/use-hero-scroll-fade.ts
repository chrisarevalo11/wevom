"use client";

import { type RefObject, useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scroll-linked opacity for the things that live on top of the hero (the fixed body layer
 * and the language switch).
 *
 * The showcase section is opaque and sits above the body layer, so without this the hero
 * gets guillotined by the incoming section edge. Instead the hero is faded out over the
 * last stretch of its own runway, before that edge reaches it: the hero goes, then the
 * next section arrives, with no visible cut.
 *
 * Read straight off scroll position on every frame — no tween, no scrub smoothing — so the
 * fade tracks the wheel exactly and reverses at whatever speed the user scrolls back up.
 */

/**
 * Fade windows at the hero's exit, in viewport heights measured from the hero's bottom
 * edge. The body is fixed and stays centred, so it can hold on until the section edge is
 * close. The language switch is sticky: once the hero's bottom rises past its offset it
 * unpins and gets shoved up the screen by the incoming section, which reads as a push
 * rather than a fade — so it has to be gone before that, hence the earlier window.
 */
const FADE_WINDOWS = {
  body: { start: 1.5, end: 0.8 },
  sticky: { start: 1.75, end: 1.15 },
} as const;

type FadeWindow = (typeof FADE_WINDOWS)[keyof typeof FADE_WINDOWS];

/**
 * Fade back in as the transparent footer arrives, measured from the footer's top edge.
 * The sections in between are opaque and hide the layer anyway, so this only has to be
 * finished by the time the footer uncovers it.
 */
const FOOTER_FADE_START_VH = 0.9;
const FOOTER_FADE_END_VH = 0.3;

/** Skips the style write for changes too small to see */
const EPSILON = 0.004;

function ramp(value: number, start: number, end: number): number {
  const span = start - end;
  if (span === 0) return value <= end ? 0 : 1;
  return Math.max(0, Math.min(1, (value - end) / span));
}

/** 1 while the hero owns the screen, 0 once its runway is spent */
function heroOpacity(viewport: number, window: FadeWindow): number {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return 1;

  const distance = hero.getBoundingClientRect().bottom;
  return ramp(distance, window.start * viewport, window.end * viewport);
}

/** 0 until the footer is on its way in, 1 by the time it has uncovered the body */
function footerOpacity(viewport: number): number {
  const footer = document.querySelector("[data-footer]");
  if (!footer) return 0;

  const top = footer.getBoundingClientRect().top;
  return ramp(
    FOOTER_FADE_START_VH * viewport - top,
    (FOOTER_FADE_START_VH - FOOTER_FADE_END_VH) * viewport,
    0,
  );
}

type UseHeroScrollFadeOptions = {
  /**
   * Which exit window to fade over. Sticky content leaves earlier — see FADE_WINDOWS.
   */
  fadeWindow?: keyof typeof FADE_WINDOWS;
  /**
   * Bring the element back as the footer arrives. The fixed body layer wants this — it is
   * the same instance that reappears at the page bottom. The language switch does not: it
   * scrolls away with the hero and never comes back.
   */
  restoreOnFooter?: boolean;
};

export function useHeroScrollFade<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { restoreOnFooter = false, fadeWindow = "body" }: UseHeroScrollFadeOptions = {},
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let previous = -1;

    const exit = FADE_WINDOWS[fadeWindow];

    const update = () => {
      const viewport = window.innerHeight;
      const opacity = restoreOnFooter
        ? Math.max(heroOpacity(viewport, exit), footerOpacity(viewport))
        : heroOpacity(viewport, exit);

      if (Math.abs(opacity - previous) < EPSILON) return;
      previous = opacity;
      element.style.opacity = String(opacity);
      // Faded out but still in the layout: keep it from swallowing clicks meant for the
      // section scrolling in over it. Clearing the property hands control back to the class.
      element.style.pointerEvents = opacity < 0.02 ? "none" : "";
    };

    update();
    // gsap's ticker rather than a private rAF loop: one shared frame callback, already
    // running for the rest of the page's scroll work.
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [ref, restoreOnFooter, fadeWindow]);
}
