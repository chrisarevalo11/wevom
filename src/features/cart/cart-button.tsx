"use client";

import { useCartCount } from "@/features/cart/hooks/use-cart-query";
import { useCartUiStore } from "@/stores/cart-ui-store";

export function CartButton() {
  const count = useCartCount();
  const open = useCartUiStore((state) => state.open);

  return (
    <button
      type="button"
      onClick={open}
      className="relative inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
    >
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
