"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * The image arrives full-bleed and shrinks into its frame as it rises: the inset is
 * `--about-t` (0 → 1 on scroll) times the resting margins, so at 0 the plate is 100vw.
 * Driven through a CSS variable rather than four tweened paddings so the two breakpoints'
 * margins stay in CSS where the rest of the layout lives.
 */
const PLATE_STYLE = {
  paddingTop: "calc(var(--about-t) * var(--about-inset-top))",
  paddingBottom: "calc(var(--about-t) * var(--about-inset))",
  paddingLeft: "calc(var(--about-t) * var(--about-inset))",
  paddingRight: "calc(var(--about-t) * var(--about-inset))",
} as const;

/** Scroll the section dissolves over once it has let go of the top */
const EXIT_FADE_VH = 50;

export function AboutImagePlate({ children }: { children: React.ReactNode }) {
  const plateRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const plate = plateRef.current;
    if (!plate) return;

    if (prefersReducedMotion()) {
      plate.style.setProperty("--about-t", "1");
      return;
    }

    gsap.fromTo(
      plate,
      { "--about-t": 0 },
      {
        "--about-t": 1,
        ease: "none",
        scrollTrigger: {
          // The section, not this plate: it goes sticky, and ScrollTrigger mismeasures
          // elements whose position shifts while stuck.
          trigger: "[data-about]",
          // From 60% of the image being on screen until it lands against the top, where
          // it pins — so the resize is over exactly as the pinned stretch begins.
          start: "top 40%",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );

    // Once the decryption is done the plate unpins and starts climbing out on its own —
    // this dissolves the whole section as it goes, so the footer is uncovered rather than
    // shoved off the top.
    gsap.to("[data-about]", {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-about]",
        // The moment the section's bottom meets the viewport's is exactly when sticky
        // releases it
        start: "bottom bottom",
        end: () => `+=${(window.innerHeight * EXIT_FADE_VH) / 100}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  return (
    <div
      ref={plateRef}
      className="sticky top-0 h-dvh w-full [--about-inset-top:64px] [--about-inset:15px] [--about-t:0] md:[--about-inset:50px]"
      style={PLATE_STYLE}
    >
      {children}
    </div>
  );
}
