"use client";

import { useCartCount } from "@/features/cart/hooks/use-cart-query";

export function CartCount() {
  const count = useCartCount();

  return (
    <span
      role="status"
      className="font-sans text-xs tabular-nums tracking-normal text-white sm:text-sm"
      aria-label={`Cart, ${count} items`}
    >
      ({count})
    </span>
  );
}
