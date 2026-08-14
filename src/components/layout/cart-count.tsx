"use client";

import { useTranslations } from "next-intl";
import { useCartCount } from "@/features/cart/hooks/use-cart-query";
import { useComingSoonStore } from "@/stores/coming-soon-store";

export function CartCount() {
  const count = useCartCount();
  const t = useTranslations("nav");
  const openComingSoon = useComingSoonStore((state) => state.open);

  // Checkout isn't live yet, so the navbar cart announces that instead of opening a drawer
  return (
    <button
      type="button"
      onClick={openComingSoon}
      className="font-sans text-xs tabular-nums tracking-normal text-white transition hover:opacity-60 sm:text-sm"
      aria-label={t("cartLabel", { count })}
    >
      ({count})
    </button>
  );
}
