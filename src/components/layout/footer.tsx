"use client";

import { usePathname } from "next/navigation";
import { FooterBodyLinks } from "@/components/layout/footer-body-links";
import { FooterBodyCanvas } from "@/components/three/footer-body-canvas";
import { REVERSED_E, ReversedEText } from "@/components/ui/reversed-e-text";

/** Bump when the year turns — deliberately fixed rather than read from the clock */
const COPYRIGHT_YEAR = 2026;

/**
 * On the home page this stays transparent and empty: the fixed body layer sits at a lower
 * z-index, hidden behind the opaque sections above, so it reappears here as the about
 * image scrolls off and ends up centred in this block.
 *
 * Everywhere else there is no fixed layer to reveal, so the footer renders its own body —
 * static, with neither the stretch nor the float animation.
 */
export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer data-footer className="relative z-10 h-dvh w-full">
      {isHome ? null : (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-full w-full max-w-md sm:max-w-xl">
            <FooterBodyCanvas />
          </div>
        </div>
      )}

      <FooterBodyLinks />

      {/* Sits under the body, clear of the page's bottom edge */}
      <p className="absolute inset-x-0 bottom-8 text-center font-sans text-sm uppercase tracking-[0.24em] sm:bottom-10 sm:text-xs">
        <ReversedEText text={`${REVERSED_E} V O M © ${COPYRIGHT_YEAR}`} />
      </p>
    </footer>
  );
}
