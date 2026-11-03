"use client";

import { useRef } from "react";
import { useLoading } from "@/components/loading/loading-provider";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Marks each fragment of the cascade: the part the scroll moves */
const FRAGMENT_ATTRIBUTE = "data-fragment";
/** The fragment's inner wrapper: the part the opening plays in */
const INNER_ATTRIBUTE = "data-fragment-inner";

/** How far a fragment travels while appearing or leaving, in px */
const RISE = 28;
/**
 * The scroll-driven life of a fragment, in viewport-height units from the moment its top
 * crosses the bottom edge: it rises in over the first stretch, holds, then lifts away over
 * the last stretch before it leaves at the top. The timeline is scrubbed, so these are also
 * the proportions of its duration.
 */
const ENTER_VH = 23;
const HOLD_VH = 54;
const LEAVE_VH = 16;
const TOTAL_VH = ENTER_VH + HOLD_VH + LEAVE_VH;
/** Where the fragment's top is, as a share of the viewport, when its life starts and ends */
const START_AT = "top 95%";
const END_AT = `top ${95 - TOTAL_VH}%`;

/**
 * The scroll moves every fragment through one scrubbed timeline: rising from below as it
 * enters at the bottom, lifting and fading as it leaves at the top, unwinding either way when
 * the wheel turns back. The fragments already on screen when the page opens cannot wait for
 * a scroll, so their inner wrappers play the same rise once, one after another, top-right
 * first, as soon as the loader lets the page through. Under reduced motion everything is
 * simply there.
 */
export function AboutCascade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isReady } = useLoading();

  // The scroll timelines, built once
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const fragments = Array.from(
        root.querySelectorAll<HTMLElement>(`[${FRAGMENT_ATTRIBUTE}]`),
      );
      if (prefersReducedMotion()) {
        gsap.set(fragments, { autoAlpha: 1 });
        return;
      }
      // Held back until the opening decides which ones play and which just appear
      gsap.set(root.querySelectorAll(`[${INNER_ATTRIBUTE}]`), {
        autoAlpha: 0,
        y: RISE,
      });

      for (const element of fragments) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: element,
              start: START_AT,
              end: END_AT,
              scrub: true,
            },
          })
          .fromTo(
            element,
            { autoAlpha: 0, y: RISE },
            { autoAlpha: 1, y: 0, duration: ENTER_VH, ease: "none" },
          )
          .to(
            element,
            { autoAlpha: 0, y: -RISE, duration: LEAVE_VH, ease: "none" },
            ENTER_VH + HOLD_VH,
          );
      }
    },
    { scope: ref },
  );

  // The opening, once the loader is out of the way
  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !isReady || prefersReducedMotion()) return;
      const fragments = Array.from(
        root.querySelectorAll<HTMLElement>(`[${FRAGMENT_ATTRIBUTE}]`),
      );
      const inView = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      };
      const playing: HTMLElement[] = [];
      const waiting: HTMLElement[] = [];
      for (const element of fragments) {
        const inner = element.querySelector<HTMLElement>(`[${INNER_ATTRIBUTE}]`);
        if (!inner) continue;
        (inView(element) ? playing : waiting).push(inner);
      }
      // Off-screen fragments are the scroll's to reveal; their inner part just needs to be there
      gsap.set(waiting, { autoAlpha: 1, y: 0 });
      gsap.fromTo(
        playing,
        { autoAlpha: 0, y: RISE },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.055 },
      );
    },
    { scope: ref, dependencies: [isReady] },
  );

  return (
    <div ref={ref} className="about-cascade">
      {children}
    </div>
  );
}

/** One fragment of the cascade: starts invisible so the entrance has something to reveal */
export function Fragment({
  index,
  curve = 0,
  className,
  innerClassName = "block",
  style,
  children,
}: {
  index: number;
  /** 0 to 1: how far along the arc this fragment is pushed in from the edge */
  curve?: number;
  className?: string;
  /** Layout for the inner wrapper, which is what lays the children out */
  innerClassName?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <span
      data-fragment=""
      style={
        { ...style, "--i": index, "--curve": curve.toFixed(4) } as React.CSSProperties
      }
      className={className}
    >
      <span data-fragment-inner="" className={innerClassName}>
        {children}
      </span>
    </span>
  );
}
