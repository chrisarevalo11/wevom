"use client";

import { usePathname } from "next/navigation";
import { FooterBodyLinks } from "@/components/layout/footer-body-links";
import { FooterBodyCanvas } from "@/components/three/footer-body-canvas";
import { REVERSED_E, ReversedEText } from "@/components/ui/reversed-e-text";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { usePageChromeStore } from "@/stores/page-chrome-store";

/** Bump when the year turns — deliberately fixed rather than read from the clock */
const COPYRIGHT_YEAR = 2026;

/**
 * The route that ends sideways rather than downwards: on desktop the catalog's horizontal rail
 * carries the footer as its last panel, so the page must not also end with one.
 */
const HORIZONTAL_ROUTE = "/products";
const SUMMARY_ROUTE = "/summary";

/**
 * The body, the links around it and the copyright — everything inside the footer box, with no
 * opinion about where that box sits. The page ends with one of these; the catalog rail puts
 * another at the far end of its track.
 *
 * `withBody` is off on the home page: the fixed body layer sits at a lower z-index, hidden
 * behind the opaque sections above, and reappears here as the about image scrolls off. Drawing
 * a second body into the same space would double it.
 */
export function FooterBody({ withBody = true }: { withBody?: boolean }) {
  return (
    <>
      {withBody ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-full w-full max-w-md sm:max-w-xl">
            <FooterBodyCanvas />
          </div>
        </div>
      ) : null}

      <FooterBodyLinks />

      {/*
       * Sits under the body, clear of the page's bottom edge. z-20 puts it over the body
       * canvas's bottom fade-to-surface, which is painted at z-10 inside this stacking
       * context and was washing the line out on every page that renders a footer body.
       */}
      <p className="absolute inset-x-0 bottom-8 z-20 text-center font-sans text-sm uppercase tracking-[0.24em] sm:bottom-10 sm:text-xs">
        <ReversedEText text={`${REVERSED_E} V O M © ${COPYRIGHT_YEAR}`} />
      </p>
    </>
  );
}

export function Footer() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const footerHidden = usePageChromeStore((state) => state.footerHidden);

  // Not merely hidden: a display:none footer would still mount a second WebGL body behind the
  // one the rail is already showing
  if (isDesktop && pathname === HORIZONTAL_ROUTE) return null;
  // The summary page keeps the body beside the cart the whole way down; a second one at the
  // end would double it (and the WebGL cost)
  if (pathname === SUMMARY_ROUTE) return null;
  // The 404 fills the screen on its own
  if (footerHidden) return null;

  return (
    <footer data-footer className="relative z-10 h-dvh w-full">
      <FooterBody withBody={pathname !== "/"} />
    </footer>
  );
}
