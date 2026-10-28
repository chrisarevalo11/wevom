"use client";

import { useTranslations } from "next-intl";
import { useCartCount } from "@/features/cart/hooks/use-cart-query";
import { useCartUiStore } from "@/stores/cart-ui-store";

export function CartCount() {
  const count = useCartCount();
  const t = useTranslations("nav");
  const openCart = useCartUiStore((state) => state.open);

  return (
    <button
      type="button"
      onClick={openCart}
      className="font-sans text-xs tabular-nums tracking-normal text-white transition hover:opacity-60 sm:text-sm"
      aria-label={t("cartLabel", { count })}
    >
      ({count})
    </button>
  );
}
