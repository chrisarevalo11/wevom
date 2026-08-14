"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { LogoWordmark } from "@/components/layout/logo-wordmark";
import { useLoading } from "@/components/loading/loading-provider";
import { APP_BACKGROUND } from "@/config/brand";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ASSEMBLE_PAUSE = 0.3;
const FLY_DURATION = 0.9;
const BG_FADE_DURATION = 0.45;
const NAV_REVEAL_BEFORE_FLY_END = FLY_DURATION * 0.35;
const LETTER_STAGGER = 0.14;

const BLINK_STEPS = [
  { opacity: 0.35, duration: 0.05 },
  { opacity: 0, duration: 0.05 },
  { opacity: 0.55, duration: 0.06 },
  { opacity: 0, duration: 0.05 },
  { opacity: 0.78, duration: 0.07 },
  { opacity: 0.12, duration: 0.04 },
  { opacity: 1, duration: 0.28, ease: "power1.out" },
] as const;

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, index) => index);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  return indices;
}

function addLetterBlinkReveal(
  timeline: gsap.core.Timeline,
  letter: HTMLElement,
  startTime: number,
) {
  let offset = 0;

  for (const step of BLINK_STEPS) {
    timeline.to(
      letter,
      {
        opacity: step.opacity,
        duration: step.duration,
        ease: "ease" in step ? step.ease : "none",
      },
      startTime + offset,
    );
    offset += step.duration;
  }
}

function waitForNextFrame(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function waitForLetterRefs(
  refs: React.RefObject<HTMLSpanElement | null>[],
): Promise<HTMLSpanElement[]> {
  return new Promise((resolve) => {
    const attempt = () => {
      const letters = refs
        .map((ref) => ref.current)
        .filter(Boolean) as HTMLSpanElement[];

      if (letters.length === refs.length) {
        resolve(letters);
        return;
      }

      requestAnimationFrame(attempt);
    };

    attempt();
  });
}

function getFlyTransform(
  group: HTMLElement,
  target: HTMLElement,
): { dx: number; dy: number; scale: number } {
  const targetRect = target.getBoundingClientRect();
  const groupRect = group.getBoundingClientRect();

  return {
    dx: targetRect.left + targetRect.width / 2 - (groupRect.left + groupRect.width / 2),
    dy: targetRect.top + targetRect.height / 2 - (groupRect.top + groupRect.height / 2),
    scale: targetRect.width / groupRect.width,
  };
}

export function PageLoader() {
  const { logoTargetRef, completeLoading, revealNavItems } = useLoading();
  const t = useTranslations("loader");
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const letterRef0 = useRef<HTMLSpanElement>(null);
  const letterRef1 = useRef<HTMLSpanElement>(null);
  const letterRef2 = useRef<HTMLSpanElement>(null);
  const letterRef3 = useRef<HTMLSpanElement>(null);
  const letterRefs = [letterRef0, letterRef1, letterRef2, letterRef3];

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        completeLoading();
      };

      const ctx = gsap.context(() => {
        const run = async () => {
          if (prefersReducedMotion()) {
            finish();
            return;
          }

          document.body.style.overflow = "hidden";

          await document.fonts.ready;
          await waitForNextFrame(2);

          const letters = await waitForLetterRefs(letterRefs);
          const overlay = overlayRef.current;
          const group = groupRef.current;
          const target = logoTargetRef.current;

          if (!overlay || !group || !target) {
            finish();
            return;
          }

          gsap.set(group, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            transformOrigin: "50% 50%",
          });
          gsap.set(overlay, { opacity: 1 });
          gsap.set(letters, { opacity: 0, x: 0, y: 0 });

          const revealOrder = shuffleIndices(letters.length);
          const timeline = gsap.timeline({ onComplete: finish });

          for (const [orderIndex, letterIndex] of revealOrder.entries()) {
            addLetterBlinkReveal(
              timeline,
              letters[letterIndex],
              orderIndex * LETTER_STAGGER,
            );
          }

          timeline.to({}, { duration: ASSEMBLE_PAUSE });

          timeline.call(() => {
            const { dx, dy, scale } = getFlyTransform(group, target);

            timeline.to(group, {
              x: dx,
              y: dy,
              scale,
              duration: FLY_DURATION,
              ease: "power3.inOut",
              force3D: true,
            });

            timeline.call(revealNavItems, undefined, `-=${NAV_REVEAL_BEFORE_FLY_END}`);

            timeline.to(overlay, {
              opacity: 0,
              duration: BG_FADE_DURATION,
              ease: "power2.out",
            });

            // Hand off to the nav logo underneath, which sits at the same position and scale
            timeline.to(
              group,
              {
                opacity: 0,
                duration: BG_FADE_DURATION,
                ease: "power2.out",
              },
              "<",
            );
          });
        };

        run().catch(() => {
          finish();
        });
      }, container);

      return () => {
        finished = true;
        ctx.revert();
        document.body.style.overflow = "";
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100]">
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{ backgroundColor: APP_BACKGROUND }}
        aria-hidden
      />

      <div
        role="status"
        aria-busy="true"
        aria-label={t("label")}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {/* Blends against the cream overlay behind it; the nav logo takes over on fade-out */}
        <div ref={groupRef} className="mix-blend-difference will-change-transform">
          <LogoWordmark variant="loader" letterRefs={letterRefs} />
        </div>
      </div>
    </div>
  );
}
