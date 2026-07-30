"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { CartCount } from "@/components/layout/cart-count";
import { Logo } from "@/components/layout/logo";
import { useLoading } from "@/components/loading/loading-provider";
import { gsap, useGSAP } from "@/lib/gsap";

export function Header() {
  const { logoTargetRef } = useLoading();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

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
            aria-label="Open menu"
          >
            MENU
          </button>
        </div>

        <div ref={logoTargetRef} className="relative justify-self-center">
          <Logo variant="nav" />
        </div>

        <div ref={cartRef} className="justify-self-end">
          <CartCount />
        </div>
      </div>
    </header>
  );
}
