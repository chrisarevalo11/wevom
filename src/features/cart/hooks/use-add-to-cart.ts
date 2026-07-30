"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCartAction } from "@/lib/shopify/actions";
import { useCartUiStore } from "@/stores/cart-ui-store";

export function useAddToCart() {
  const queryClient = useQueryClient();
  const open = useCartUiStore((state) => state.open);
  const setOptimisticCount = useCartUiStore((state) => state.setOptimisticCount);

  return useMutation({
    mutationFn: async ({
      merchandiseId,
      quantity = 1,
    }: {
      merchandiseId: string;
      quantity?: number;
    }) => {
      const result = await addToCartAction(merchandiseId, quantity);
      if (result.error) throw new Error(result.error);
      return result.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      setOptimisticCount(cart?.totalQuantity ?? 0);
      open();
    },
  });
}
