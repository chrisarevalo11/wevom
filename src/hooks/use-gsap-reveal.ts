import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type UseGsapRevealOptions = {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  childSelector?: string;
};

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapRevealOptions = {},
) {
  const containerRef = useRef<T>(null);
  const { y = 32, duration = 0.8, delay = 0, stagger = 0.1, childSelector } = options;

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      const targets = childSelector
        ? containerRef.current.querySelectorAll(childSelector)
        : containerRef.current;

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: containerRef },
  );

  return containerRef;
}
