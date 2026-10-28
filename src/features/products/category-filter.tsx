"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  MARKER_DOT_SLOT,
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/config/product-categories";
import { useTravellingDot } from "@/hooks/use-travelling-dot";
import { cn } from "@/lib/utils/cn";

type CategoryFilterProps = {
  selected: ProductCategory;
  onSelect: (category: ProductCategory) => void;
  /** A wrapping row under the header on a phone, a column beside the rail on desktop */
  orientation?: "row" | "column";
  /**
   * "invert" is for the copy inside a mix-blend-difference layer, the way the navbar does it.
   * It is painted white and the blend subtracts it from the surface behind: over the page that
   * lands back on the ordinary near-black, and over a card passing underneath it flips. The
   * muted grey of the default tone has no meaning once it is inverted, so the inactive state
   * is white held back to 60% instead, which lands on roughly the same grey.
   */
  tone?: "default" | "invert";
};

const TONE = {
  default: { active: TEXT_LINK_ACTIVE, inactive: TEXT_LINK_INACTIVE, dot: "text-text" },
  invert: {
    active: "font-semibold text-white",
    inactive: "text-white/60 hover:text-white",
    dot: "text-white",
  },
} as const;

const LAYOUT = {
  row: "flex w-full flex-row flex-wrap justify-between gap-x-6 gap-y-3",
  column: "flex h-full flex-col items-start justify-between gap-3",
} as const;

export function CategoryFilter({
  selected,
  onSelect,
  orientation = "row",
  tone = "default",
}: CategoryFilterProps) {
  const t = useTranslations("products.categories");
  const [previewed, setPreviewed] = useState<ProductCategory | null>(null);
  const colors = TONE[tone];

  /*
   * One dot for the whole group: it travels to whichever category is hovered (or focused) and
   * back to the selection the moment the pointer leaves.
   */
  const { containerRef, dotRef, registerTarget } = useTravellingDot(
    previewed ?? selected,
  );

  return (
    <nav
      ref={containerRef}
      aria-label={t("label")}
      className={cn("relative", LAYOUT[orientation])}
    >
      {/*
       * The travelling dot. Positioned at the group's origin and moved by GSAP alone — no
       * Tailwind transform or `transition` utility on it, either would fight the tween.
       */}
      <span
        ref={dotRef}
        aria-hidden
        className={cn(
          MARKER_DOT_SLOT,
          "pointer-events-none invisible absolute left-0 top-0 font-sans text-xs uppercase tracking-[0.24em] sm:text-sm",
          colors.dot,
        )}
      >
        ·
      </span>

      {PRODUCT_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          ref={registerTarget(category)}
          aria-pressed={category === selected}
          onClick={() => onSelect(category)}
          onMouseEnter={() => setPreviewed(category)}
          onMouseLeave={() => setPreviewed(null)}
          onFocus={() => setPreviewed(category)}
          onBlur={() => setPreviewed(null)}
          className={cn(
            TEXT_LINK_CLASS,
            "cursor-pointer",
            category === selected ? colors.active : colors.inactive,
          )}
        >
          <span aria-hidden className={MARKER_DOT_SLOT} />
          {t(category)}
        </button>
      ))}
    </nav>
  );
}
