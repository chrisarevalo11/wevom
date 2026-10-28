import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The site's one product reveal: each element fades on its own position, scrubbed rather than
 * played, so opacity tracks the scroll wheel directly and scrolling back up unwinds it at
 * exactly the speed the wheel moves. Shared so the home showcase and the catalog can't drift
 * apart — they are the same cards and must behave identically.
 */
export function revealOnScroll(elements: HTMLElement[]): void {
  if (elements.length === 0) return;

  if (prefersReducedMotion()) {
    gsap.set(elements, { autoAlpha: 1 });
    return;
  }

  for (const element of elements) {
    gsap.fromTo(
      element,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          end: "top 65%",
          scrub: true,
        },
      },
    );
  }
}
