"use client";

import { useMemo, useState } from "react";
import { RAIL_SPACE_ABOVE, RAIL_SPACE_BELOW } from "@/config/catalog-layout";
import {
  matchesCategory,
  type ProductCategory,
  type ProductFamily,
} from "@/config/product-categories";
import { CategoryFilter } from "@/features/products/category-filter";
import { HorizontalCatalog } from "@/features/products/horizontal-catalog";
import type { ProductCardItem } from "@/features/products/product-media-card";
import { ScatteredCatalog } from "@/features/products/scattered-catalog";

export type CatalogItem = ProductCardItem & { category: ProductFamily | null };

/**
 * Owns the selected category — the filter and the cards are two halves of one control, so the
 * state lives with neither of them.
 *
 * The two breakpoints are genuinely different pages: a phone scrolls the scatter down, desktop
 * pins it and runs it sideways past a standing column of categories. Only one of them is ever
 * in the layout, so the other's images are never fetched.
 */
export function CatalogBrowser({
  items,
  emptyLabel,
}: {
  items: CatalogItem[];
  emptyLabel: string;
}) {
  const [category, setCategory] = useState<ProductCategory>("all");

  const visible = useMemo(
    () => items.filter((item) => matchesCategory(item.category, category)),
    [items, category],
  );

  return (
    <>
      <div className={`px-3 pb-32 sm:px-4 lg:hidden ${RAIL_SPACE_ABOVE}`}>
        <CategoryFilter selected={category} onSelect={setCategory} />

        <div className={RAIL_SPACE_BELOW}>
          {visible.length > 0 ? (
            <ScatteredCatalog items={visible} />
          ) : (
            <p className="text-center font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
              {emptyLabel}
            </p>
          )}
        </div>
      </div>

      <HorizontalCatalog
        items={visible}
        emptyLabel={emptyLabel}
        filter={
          <CategoryFilter
            selected={category}
            onSelect={setCategory}
            orientation="column"
            tone="invert"
          />
        }
      />
    </>
  );
}
