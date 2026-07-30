"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type BodyLink = {
  href: string;
  label: string;
  position: string;
  /** Placeholder entry — never renders as active, even when its href matches */
  isTodo?: boolean;
};

/**
 * Positioned around the body that shows through the transparent footer — roughly chest
 * height for the upper pair, knee height for the lower pair.
 */
const BODY_LINKS: BodyLink[] = [
  { href: "/", label: "Home", position: "left-[8%] top-[34%] sm:left-[16%]" },
  {
    href: "/products",
    label: "Products",
    position: "right-[8%] top-[34%] sm:right-[16%]",
  },
  { href: "/about", label: "About", position: "left-[12%] top-[64%] sm:left-[21%]" },
  // TODO: pick the fourth destination (contact? journal?) and update href + label
  { href: "/", label: "TODO", isTodo: true, position: "right-[12%] top-[64%] sm:right-[21%]" },
];

export function FooterBodyLinks() {
  const pathname = usePathname();

  return (
    <>
      {BODY_LINKS.map(({ href, label, position, isTodo }) => {
        const isActive = !isTodo && pathname === href;

        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "absolute font-sans text-xs uppercase tracking-[0.24em] transition sm:text-sm",
              position,
              isActive ? "font-semibold text-text" : "text-text-muted hover:text-text",
            )}
          >
            {isActive ? <span aria-hidden>·&nbsp;</span> : null}
            {label}
          </Link>
        );
      })}
    </>
  );
}
