"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { BodySceneCanvas } from "@/components/three/body-scene-canvas";
import { LOCALE_SWITCH_TOP } from "@/config/layout";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

/** How far up the blurred body comes — enough to read as a presence, not to fight the links */
const SCENE_OPACITY = 0.55;

/** `key` indexes into the nav messages; the label itself comes from the catalog */
const MENU_LINKS = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
  { href: "/about", key: "about" },
] as const;

type MenuOverlayProps = {
  isOpen: boolean;
  /** Fires when a link is picked, so the header can drop the menu back to MENU */
  onNavigate: () => void;
  /** Matches the aria-controls on the toggle button */
  id: string;
};

export function MenuOverlay({ isOpen, onNavigate, id }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [isMounted, setIsMounted] = useState(false);
  /**
   * Gates the WebGL body behind the links. A second canvas and model instance is real work,
   * so it only exists while the menu is up — mounted on open, torn down once the close
   * animation has fully reversed (not the instant it starts, or it would pop out mid-slide).
   */
  const [isSceneMounted, setIsSceneMounted] = useState(false);

  // The panel is portalled to <body>, which only exists on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Built once and then played / reversed. A timeline that outlives the open state is what
  // lets a mid-animation toggle pick up from wherever it is instead of jumping.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const panel = root.querySelector("[data-menu-panel]");
      const scene = root.querySelector("[data-menu-scene]");
      const items = gsap.utils.toArray<HTMLElement>("[data-menu-item]", root);
      if (!panel) return;

      // Reduced motion still needs the timeline — it just resolves instantly, so the
      // overlay appears and disappears without sliding
      const duration = prefersReducedMotion() ? 0 : 0.6;

      timelineRef.current = gsap
        .timeline({
          paused: true,
          // Only safe to drop the canvas once the reverse has finished playing out
          onReverseComplete: () => setIsSceneMounted(false),
        })
        .fromTo(
          panel,
          { yPercent: -100 },
          { yPercent: 0, duration, ease: "power3.inOut" },
        )
        // Settles in behind the links rather than arriving with them
        .fromTo(
          scene,
          { autoAlpha: 0 },
          { autoAlpha: SCENE_OPACITY, duration: duration * 1.1, ease: "power2.out" },
          duration * 0.3,
        )
        .fromTo(
          items,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration * 0.65,
            stagger: duration * 0.14,
            ease: "power2.out",
          },
          duration * 0.55,
        );
    },
    // Depends on isMounted: on the very first pass the portal has not rendered yet, so
    // rootRef is still null and there is nothing to build the timeline from
    { scope: rootRef, dependencies: [isMounted], revertOnUpdate: true },
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (isOpen) {
      setIsSceneMounted(true);
      timeline.play();
    } else {
      // Reversing replays the entry backwards — panel, body and the link stagger all
      // unwind in the opposite order
      timeline.reverse();
    }
  }, [isOpen]);

  // The overlay owns the whole viewport while open, so the page behind it must not scroll
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isMounted) return null;

  /*
   * Portalled to <body> rather than left inside <header> for two reasons: the header carries
   * mix-blend-difference, which would invert the panel's background along with it, and the
   * header's own z-40 is a stacking context — any overlay nested inside it paints above the
   * MENU / CLOSE button no matter how the z-indexes are ordered. Out here, z-30 keeps the
   * panel under the z-40 header, so the button stays visible and clickable while open.
   */
  return createPortal(
    <div
      ref={rootRef}
      id={id}
      // overflow-hidden is what hides the panel: closed, it sits translated fully above
      className={cn(
        "fixed inset-0 z-30 overflow-hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      // Keeps the closed menu out of the tab order and off screen readers without
      // unmounting it — the timeline needs the nodes to stay put
      inert={!isOpen}
    >
      {/*
       * Deliberately no -translate-y-full here to pre-hide it: Tailwind v4 compiles translate
       * utilities to the standalone `translate` property, which composes with — rather than
       * loses to — the `transform` GSAP writes, so the offset would never come off. Nothing
       * flashes without it, because useGSAP applies yPercent in a layout effect during the
       * same commit that first renders this portal, before the browser paints.
       */}
      <div
        data-menu-panel
        className="relative flex h-full w-full flex-col items-center justify-center bg-surface"
      >
        {/*
         * Its own instance of the body, blurred back so the links stay legible on top. The
         * wrapper is always in the DOM — the timeline needs a stable target — while only the
         * canvas inside it comes and goes with the menu.
         */}
        <div
          data-menu-scene
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center blur-sm"
        >
          <div className="h-full w-full max-w-md sm:max-w-xl">
            {isSceneMounted ? (
              <BodySceneCanvas
                variant="hero"
                enableStretch={false}
                enableFloat={false}
                showGradient={false}
                className="touch-none"
              />
            ) : null}
          </div>
        </div>

        <nav aria-label={t("main")} className="relative">
          <ul className="flex flex-col items-end gap-10 sm:gap-12">
            {MENU_LINKS.map(({ href, key }) => {
              const isActive = pathname === href;

              return (
                <li key={href} data-menu-item>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    // Same active treatment as the footer links: weight plus a leading dot
                    className={cn(
                      "font-sans text-lg uppercase tracking-[0.24em] transition sm:text-xl",
                      isActive
                        ? "font-semibold text-text"
                        : "text-text-muted hover:text-text",
                    )}
                  >
                    {isActive ? <span aria-hidden>·&nbsp;</span> : null}
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/*
         * Same offset as the hero, measured from the top of the panel (which is exactly one
         * viewport tall), so the switch does not move when the menu opens over it.
         * data-menu-item enrolls it in the stagger, arriving last.
         */}
        <div
          data-menu-item
          className={cn("absolute inset-x-0 flex justify-center", LOCALE_SWITCH_TOP)}
        >
          <LocaleSwitch />
        </div>
      </div>
    </div>,
    document.body,
  );
}
