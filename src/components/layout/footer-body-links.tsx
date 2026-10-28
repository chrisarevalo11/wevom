"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  MARKER_DOT_SLOT,
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { useTravellingDot } from "@/hooks/use-travelling-dot";
import { cn } from "@/lib/utils/cn";

type LinkKey = "home" | "products" | "about" | "instagram";

type BodyLink = {
  href: string;
  /** Indexes into the nav messages, and identifies the link to the travelling dot */
  key: LinkKey;
  position: string;
  /** Leaves the site — renders as a plain anchor in a new tab, never as the active page */
  isExternal?: boolean;
};

/**
 * Positioned around the body that shows through the transparent footer — roughly chest
 * height for the upper pair, knee height for the lower pair.
 */
const BODY_LINKS: BodyLink[] = [
  { href: "/", key: "home", position: "left-[8%] top-[34%] sm:left-[16%]" },
  {
    href: "/products",
    key: "products",
    position: "right-[8%] top-[34%] sm:right-[16%]",
  },
  { href: "/about", key: "about", position: "left-[8%] top-[64%] sm:left-[16%]" },
  {
    href: "https://www.instagram.com/evom_dw/",
    key: "instagram",
    isExternal: true,
    position: "right-[8%] top-[64%] sm:right-[16%]",
  },
];

/**
 * The shared text-button type, absolutely placed over the body. z-20 clears the canvas's
 * bottom fade, which is painted at z-10 inside this same stacking context.
 */
const LINK_CLASS = cn("absolute z-20", TEXT_LINK_CLASS);

/**
 * The dot travels the width of the footer between these, so it moves slower than the tight
 * rail on the catalog — the same duration over that distance reads as a snap.
 */
const DOT_DURATION = 0.7;

export function FooterBodyLinks() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [previewed, setPreviewed] = useState<LinkKey | null>(null);

  const active = BODY_LINKS.find(
    (link) => !link.isExternal && link.href === pathname,
  )?.key;

  // Falls back to "home" only as a parking spot: on a page none of these link to, the dot
  // has to sit somewhere, and it is hidden there until something is hovered
  const marked = previewed ?? active ?? "home";

  const { containerRef, dotRef, registerTarget } = useTravellingDot(marked, {
    duration: DOT_DURATION,
    // Nothing on this page is marked, so the dot only shows while a link is hovered
    shown: Boolean(previewed ?? active),
  });

  return (
    <nav
      ref={containerRef}
      aria-label={t("footer")}
      className="pointer-events-none absolute inset-0"
    >
      {/*
       * One dot for all four links, parked at this layer's origin and moved by GSAP alone —
       * no Tailwind transform or `transition` utility on it, either would fight the tween.
       */}
      <span
        ref={dotRef}
        aria-hidden
        className={cn(
          MARKER_DOT_SLOT,
          "pointer-events-none invisible absolute left-0 top-0 z-20 font-sans text-xs uppercase tracking-[0.24em] text-text sm:text-sm",
        )}
      >
        ·
      </span>

      {BODY_LINKS.map(({ href, key, position, isExternal }) => {
        const isActive = key === active;
        // The layer itself is click-through so it never covers the page behind it
        const className = cn(
          LINK_CLASS,
          position,
          "pointer-events-auto",
          isActive ? TEXT_LINK_ACTIVE : TEXT_LINK_INACTIVE,
        );

        /*
         * Every prop is written out on both branches rather than spread from a shared
         * object: a spread compiles to createElement, and createElement treats these two
         * children as a plain array React then wants keys for.
         */
        return isExternal ? (
          <a
            key={key}
            ref={registerTarget(key)}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={className}
            onMouseEnter={() => setPreviewed(key)}
            onMouseLeave={() => setPreviewed(null)}
            onFocus={() => setPreviewed(key)}
            onBlur={() => setPreviewed(null)}
          >
            <span aria-hidden className={MARKER_DOT_SLOT} />
            {t(key)}
          </a>
        ) : (
          <Link
            key={key}
            ref={registerTarget(key)}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={className}
            onMouseEnter={() => setPreviewed(key)}
            onMouseLeave={() => setPreviewed(null)}
            onFocus={() => setPreviewed(key)}
            onBlur={() => setPreviewed(null)}
          >
            <span aria-hidden className={MARKER_DOT_SLOT} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
