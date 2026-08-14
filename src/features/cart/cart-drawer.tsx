"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Price } from "@/components/ui/price";
import type { ShopifyCartLine } from "@/lib/shopify";
import { removeCartLineAction, updateCartLineAction } from "@/lib/shopify/actions";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { useCartQuery } from "./hooks/use-cart-query";

function CartLineItem({ line }: { line: ShopifyCartLine }) {
  const t = useTranslations("cart");
  const queryClient = useQueryClient();
  const setOptimisticCount = useCartUiStore((state) => state.setOptimisticCount);

  const updateMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const result = await updateCartLineAction(line.id, quantity);
      if (result.error) throw new Error(result.error);
      return result.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      setOptimisticCount(cart?.totalQuantity ?? 0);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const result = await removeCartLineAction(line.id);
      if (result.error) throw new Error(result.error);
      return result.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      setOptimisticCount(cart?.totalQuantity ?? 0);
    },
  });

  const image = line.merchandise.image ?? line.merchandise.product.featuredImage;

  return (
    <div className="flex gap-4 border-b border-border py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? line.merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div>
          <Link
            href={`/products/${line.merchandise.product.handle}`}
            className="font-medium hover:underline"
            onClick={() => useCartUiStore.getState().close()}
          >
            {line.merchandise.product.title}
          </Link>
          <p className="text-sm text-text-muted">{line.merchandise.title}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-border"
              aria-label={t("decrease")}
              onClick={() => updateMutation.mutate(Math.max(1, line.quantity - 1))}
              disabled={updateMutation.isPending}
            >
              -
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-border"
              aria-label={t("increase")}
              onClick={() => updateMutation.mutate(line.quantity + 1)}
              disabled={updateMutation.isPending}
            >
              +
            </button>
          </div>
          <Price
            amount={(
              Number.parseFloat(line.merchandise.price.amount) * line.quantity
            ).toFixed(2)}
            currencyCode={line.merchandise.price.currencyCode}
          />
        </div>

        <button
          type="button"
          className="self-start text-sm text-text-muted hover:text-text"
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
        >
          {t("remove")}
        </button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const t = useTranslations("cart");
  const isOpen = useCartUiStore((state) => state.isOpen);
  const close = useCartUiStore((state) => state.close);
  const { data: cart, isLoading } = useCartQuery();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-label={t("closeCart")}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">{t("drawerTitle")}</h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full px-3 py-1 text-sm text-text-muted hover:bg-surface-muted"
          >
            {t("close")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <p className="py-8 text-sm text-text-muted">{t("loading")}</p>
          ) : cart && cart.lines.length > 0 ? (
            cart.lines.map((line) => <CartLineItem key={line.id} line={line} />)
          ) : (
            <p className="py-8 text-sm text-text-muted">{t("empty")}</p>
          )}
        </div>

        <div className="border-t border-border px-6 py-4">
          {cart ? (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-text-muted">{t("subtotal")}</span>
              <Price
                amount={cart.cost.subtotalAmount.amount}
                currencyCode={cart.cost.subtotalAmount.currencyCode}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <Link
              href="/cart"
              onClick={close}
              className="inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-surface-muted"
            >
              {t("viewCart")}
            </Link>
            {cart?.checkoutUrl ? (
              <a
                href={cart.checkoutUrl}
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                {t("checkout")}
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
