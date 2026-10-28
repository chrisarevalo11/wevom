"use client";

import { useRef } from "react";
import { REVERSED_E } from "@/components/ui/reversed-e-text";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

/**
 * Pool the still-encrypted characters cycle through: the brand's own four letters, so the
 * noise reads as EVOM scrambling itself rather than as generic garbage. REVERSED_E is
 * rendered the wordmark's way — a mirrored real E, not the Ǝ glyph.
 */
const GLYPHS = [REVERSED_E, "V", "O", "M"] as const;

/**
 * Matches ReversedEText's mirroring, applied per character as they churn.
 *
 * The margins undo what the flip does to spacing: letter-spacing rides on the *right* of a
 * character, so mirroring the box lands that gap on the left and leaves the E's stem
 * shoulder-to-shoulder with the next letter. Shifting back by one tracking unit and adding
 * it after restores even sidebearings. Set `--decrypt-tracking` on any ancestor to the
 * element's letter-spacing; it inherits, and without it the correction is simply zero.
 */
const MIRRORED_CLASS =
  "inline-block -scale-x-100 ml-[calc(var(--decrypt-tracking,0em)*-1)] mr-[var(--decrypt-tracking,0em)]";

/**
 * The copy marks its reversed E with the Ǝ glyph, the same convention ReversedEText reads.
 * Both the noise and the resolved text render it as a mirrored real E, so the brand's own
 * letter never appears the wrong way round.
 */
function paint(span: HTMLSpanElement, char: string) {
  const isReversed = char === REVERSED_E;
  span.textContent = isReversed ? "E" : char;
  span.className = isReversed ? MIRRORED_CLASS : "";
}

/** Scramble refresh, in seconds: fast enough to read as noise, slow enough to stay legible */
const CHURN_INTERVAL = 1 / 14;

type DecryptTextProps = {
  text: string;
  /**
   * Element whose scroll drives the reveal. A selector rather than a ref so a Server
   * Component can wire this up, and it should point at the *section*, never at a sticky
   * child — ScrollTrigger mismeasures elements whose position shifts while stuck.
   */
  triggerSelector: string;
  /** Scroll distance the full decryption spans, in viewport heights */
  scrollVh: number;
  className?: string;
};

/**
 * Reveals `text` one character at a time as the page scrolls: the tail is still garbage
 * until the scroll reaches it. Position-driven, so scrolling back up re-encrypts it.
 */
export function DecryptText({
  text,
  triggerSelector,
  scrollVh,
  className,
}: DecryptTextProps) {
  const outputRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const output = outputRef.current;
      if (!output) return;

      // One span per character, reused every frame: a mirrored E needs its own element,
      // and rewriting textContent wholesale would throw the spans away each churn.
      const characters = Array.from(text);
      const spans = characters.map(() => document.createElement("span"));
      output.replaceChildren(...spans);

      const trigger = document.querySelector(triggerSelector);
      if (!trigger || prefersReducedMotion()) {
        characters.forEach((char, index) => paint(spans[index], char));
        return;
      }

      let progress = 0;
      let sinceChurn = 0;
      // Churns from the moment the text is on screen, not from where the decryption
      // starts: the scramble is alive while the plate is still sliding in, and the scroll
      // only decides how much of it has resolved. Offscreen it stops — nothing to repaint.
      let isVisible = false;

      const render = () => {
        const revealed = Math.floor(progress * characters.length);

        characters.forEach((char, index) => {
          const span = spans[index];

          // Spaces stay spaces — scrambling them costs the word shape for nothing
          if (char === " " || index < revealed) {
            paint(span, char);
            return;
          }

          paint(span, GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
        });
      };

      render();

      // The churn is what sells it as decryption rather than a wipe: the unrevealed tail
      // keeps rolling even while the scroll is still. It stops once there's nothing left
      // to scramble.
      const churn = (_time: number, delta: number) => {
        if (!isVisible || progress >= 1) return;
        sinceChurn += delta;
        if (sinceChurn < CHURN_INTERVAL * 1000) return;
        sinceChurn = 0;
        render();
      };

      gsap.ticker.add(churn);

      const scrollTrigger = ScrollTrigger.create({
        trigger,
        start: "top top",
        end: () => `+=${(window.innerHeight * scrollVh) / 100}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          render();
        },
      });

      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      });

      observer.observe(output);

      return () => {
        observer.disconnect();
        gsap.ticker.remove(churn);
        scrollTrigger.kill();
      };
    },
    { dependencies: [text, triggerSelector, scrollVh] },
  );

  return (
    // Both spans share one grid cell: the invisible copy holds the final width so the line
    // doesn't collapse before the first paint or jump as glyphs swap.
    <span className={cn("inline-grid text-center", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre">
        {text.replaceAll(REVERSED_E, "E")}
      </span>
      <span
        ref={outputRef}
        aria-hidden
        className="col-start-1 row-start-1 whitespace-pre"
      />
      {/* The marker glyph would be read aloud as its own letter */}
      <span className="sr-only">{text.replaceAll(REVERSED_E, "E")}</span>
    </span>
  );
}
