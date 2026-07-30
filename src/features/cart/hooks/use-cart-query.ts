"use client";

import { useQuery } from "@tanstack/react-query";
import { getCartAction } from "@/lib/shopify/actions";
import { useCartUiStore } from "@/stores/cart-ui-store";

export function useCartQuery() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCartAction,
  });
}

export function useCartCount() {
  const { data } = useCartQuery();
  const optimisticCount = useCartUiStore((state) => state.optimisticCount);
  return data?.totalQuantity ?? optimisticCount;
}
