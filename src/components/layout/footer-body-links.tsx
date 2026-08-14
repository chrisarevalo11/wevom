"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

type BodyLink = {
  href: string;
  /** Indexes into the nav messages */
  key: "home" | "products" | "about" | "instagram";
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
  // About is off until the page is ready — see src/app/(marketing)/about/page.tsx.
  // Instagram takes the whole lower row on its own rather than sitting off to one side.
  {
    href: "https://www.instagram.com/evom_dw/",
    key: "instagram",
    isExternal: true,
    position: "left-1/2 top-[64%] -translate-x-1/2",
  },
];

const LINK_CLASS =
  "absolute font-sans text-xs uppercase tracking-[0.24em] transition sm:text-sm";
const INACTIVE_CLASS = "text-text-muted hover:text-text";

export function FooterBodyLinks() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <>
      {BODY_LINKS.map(({ href, key, position, isExternal }) =>
        isExternal ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cn(LINK_CLASS, position, INACTIVE_CLASS)}
          >
            {t(key)}
          </a>
        ) : (
          <Link
            key={key}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              LINK_CLASS,
              position,
              pathname === href ? "font-semibold text-text" : INACTIVE_CLASS,
            )}
          >
            {pathname === href ? <span aria-hidden>·&nbsp;</span> : null}
            {t(key)}
          </Link>
        ),
      )}
    </>
  );
}
