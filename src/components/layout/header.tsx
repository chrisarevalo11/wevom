"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CartCount } from "@/components/layout/cart-count";
import { Logo } from "@/components/layout/logo";
import { MenuOverlay } from "@/components/layout/menu-overlay";
import { useLoading } from "@/components/loading/loading-provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

const MENU_ID = "main-menu";

/** Fades roughly with the panel slide, so the chrome clears as the menu arrives */
const CHROME_CLASS = "transition-opacity duration-500 ease-out";

export function Header() {
  const { logoTargetRef } = useLoading();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("nav");

  // A route change from anywhere else (browser back, a link in the page) leaves the menu
  // stale, so close it whenever the path actually changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a read
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useGSAP(
    () => {
      // Home only. Keyed on pathname so client-side navigation tears the tween down —
      // the header never unmounts, so a stale ScrollTrigger would otherwise persist.
      if (pathname !== "/") return;

      const menu = menuRef.current;
      const cart = cartRef.current;
      if (!menu || !cart) return;

      const hero = document.querySelector("[data-hero]");
      if (!hero) return;

      const bodyCenterY = window.innerHeight * 0.45;

      gsap.fromTo(
        [menu, cart],
        { y: bodyCenterY },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: headerRef, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <header ref={headerRef} className="sticky top-0 z-40 mix-blend-difference">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 lg:px-12">
        <div className="justify-self-start">
          <button
            ref={menuRef}
            type="button"
            className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-white sm:text-sm"
            aria-expanded={isMenuOpen}
            aria-controls={MENU_ID}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? t("close") : t("menu")}
          </button>
        </div>

        {/*
         * Wordmark and cart drop away while the menu is up, leaving only CLOSE. inert rather
         * than a conditional render: the loading provider measures the logo target, and the
         * scroll tween holds an inline transform on the cart — unmounting either would lose
         * that state.
         */}
        <div
          ref={logoTargetRef}
          className={cn(CHROME_CLASS, "relative justify-self-center", {
            "opacity-0": isMenuOpen,
          })}
          inert={isMenuOpen}
        >
          <Logo variant="nav" />
        </div>

        <div
          ref={cartRef}
          className={cn(CHROME_CLASS, "justify-self-end", {
            "opacity-0": isMenuOpen,
          })}
          inert={isMenuOpen}
        >
          <CartCount />
        </div>
      </div>

      {/* Portals itself to <body> — see the note in menu-overlay.tsx */}
      <MenuOverlay
        id={MENU_ID}
        isOpen={isMenuOpen}
        onNavigate={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
