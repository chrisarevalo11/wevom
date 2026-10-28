"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type TravellingDotOptions = {
  duration?: number;
  /**
   * Whether the dot should be on screen at all. GSAP owns the dot's opacity outright — a
   * Tailwind opacity class would be overridden by the inline value it writes — so a group
   * with nothing to mark passes false rather than styling the dot away itself.
   */
  shown?: boolean;
};

/**
 * One physical dot shared by a group of text buttons, moved to whichever of them is `marked`.
 *
 * The dot is a single element parked at the container's origin and translated to the target's
 * offset, so it visibly travels between the labels rather than disappearing from one and
 * appearing on another. Callers reserve the dot's width (MARKER_DOT_SLOT) on every label, so
 * nothing in the group shifts while it moves.
 *
 * The container must be positioned — it is the offsetParent the measurements are taken
 * against — and the dot must carry no transform or `transition` utility of its own.
 */
export function useTravellingDot<Key extends string>(
  marked: Key,
  { duration = 0.45, shown = true }: TravellingDotOptions = {},
) {
  const containerRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const targetsRef = useRef(new Map<Key, HTMLElement>());
  /** Flipped after the first placement: the dot appears where it belongs, it doesn't fly in */
  const placedRef = useRef(false);
  // Bumped by the resize observer below to re-run the placement against new geometry
  const [layoutTick, setLayoutTick] = useState(0);

  const registerTarget = (key: Key) => (node: HTMLElement | null) => {
    if (node) targetsRef.current.set(key, node);
    else targetsRef.current.delete(key);
  };

  // A width change can move a target — a wrapped row, a repositioned footer link — so the
  // dot has to be re-measured rather than left behind at a stale offset
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => setLayoutTick((tick) => tick + 1));
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const dot = dotRef.current;
      const target = targetsRef.current.get(marked);
      if (!dot || !target) return;

      // offsetLeft/Top are relative to the container, which is both the dot's positioned
      // ancestor and its origin — so these are the translation outright
      const { offsetLeft: x, offsetTop: y } = target;
      const autoAlpha = shown ? 1 : 0;

      if (!placedRef.current || prefersReducedMotion()) {
        placedRef.current = true;
        gsap.set(dot, { x, y, autoAlpha });
        return;
      }

      /*
       * autoAlpha is re-asserted on every move, not just on the first placement. useGSAP
       * reverts its context whenever the component remounts — which React does on purpose in
       * development — and that revert wipes the inline visibility back to the hidden class
       * the dot starts with. Without this the dot would stay invisible for the rest of the
       * page's life, because `placedRef` survives the revert and skips the branch above.
       */
      gsap.to(dot, { x, y, autoAlpha, duration, ease: "power3.out", overwrite: true });
    },
    { dependencies: [marked, shown, layoutTick, duration] },
  );

  return { containerRef, dotRef, registerTarget };
}
