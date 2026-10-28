"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TrashIcon } from "@/components/ui/icons";
import { Price } from "@/components/ui/price";
import {
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { ShopifyCartLine } from "@/lib/shopify";
import { removeCartLineAction, updateCartLineAction } from "@/lib/shopify/actions";
import { cn } from "@/lib/utils/cn";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { useCartQuery } from "./hooks/use-cart-query";

const TEXT_BUTTON = cn(
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
  "cursor-pointer disabled:cursor-default disabled:opacity-40",
);

/** One cart line with its stepper and remove control; the summary page lists the same rows */
export function CartLineItem({ line }: { line: ShopifyCartLine }) {
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
  // Shopify keeps a line whose stock ran out, at quantity 0 — only removing it makes sense
  const soldOut = line.quantity === 0;

  return (
    <div className="flex gap-5 py-6">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface-muted">
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

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <Link
              href={`/products/${line.merchandise.product.handle}`}
              className="block font-sans text-xs font-medium uppercase tracking-[0.18em] text-text transition hover:opacity-60 sm:text-sm"
              onClick={() => useCartUiStore.getState().close()}
            >
              {line.merchandise.product.title}
            </Link>
            <p className="font-sans text-xs tracking-wide text-text-muted">
              {line.merchandise.title || t("oneSize")}
            </p>
          </div>
          {soldOut ? (
            <span className="shrink-0 font-sans text-xs uppercase tracking-[0.12em] text-text-muted sm:text-sm">
              {t("soldOut")}
            </span>
          ) : (
            <Price
              amount={(
                Number.parseFloat(line.merchandise.price.amount) * line.quantity
              ).toFixed(2)}
              currencyCode={line.merchandise.price.currencyCode}
              className="shrink-0 whitespace-nowrap font-sans text-xs font-normal uppercase tracking-[0.12em] text-text sm:text-sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-4", soldOut && "invisible")}>
            <button
              type="button"
              className={TEXT_BUTTON}
              aria-label={t("decrease")}
              onClick={() => updateMutation.mutate(Math.max(1, line.quantity - 1))}
              disabled={updateMutation.isPending || line.quantity <= 1}
            >
              −
            </button>
            <span className="font-sans text-xs tabular-nums text-text sm:text-sm">
              {line.quantity}
            </span>
            <button
              type="button"
              className={TEXT_BUTTON}
              aria-label={t("increase")}
              onClick={() => updateMutation.mutate(line.quantity + 1)}
              disabled={
                updateMutation.isPending ||
                (line.merchandise.quantityAvailable !== null &&
                  line.quantity >= line.merchandise.quantityAvailable)
              }
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={cn(TEXT_BUTTON, "-mr-1 p-1")}
            aria-label={t("remove")}
            title={t("remove")}
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
          >
            <TrashIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Same motion as the menu overlay — the panel slides in, then its sections stagger up once it
 * lands — but as a side drawer: a narrow surface panel that enters from the right over a scrim.
 * See menu-overlay.tsx for why the timeline is built once and played / reversed rather than
 * rebuilt per open.
 */
export function CartDrawer() {
  const t = useTranslations("cart");
  const tNav = useTranslations("nav");
  const isOpen = useCartUiStore((state) => state.isOpen);
  const close = useCartUiStore((state) => state.close);
  const { data: cart, isLoading } = useCartQuery();
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  // Server HTML would paint the panel un-translated before GSAP could hide it
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const panel = root.querySelector("[data-cart-panel]");
      const scrim = root.querySelector("[data-cart-scrim]");
      // Static sections only — cart lines come and go after the timeline is built
      const items = gsap.utils.toArray<HTMLElement>("[data-cart-item]", root);
      if (!panel) return;

      const duration = prefersReducedMotion() ? 0 : 0.6;

      timelineRef.current = gsap
        .timeline({ paused: true })
        .fromTo(
          panel,
          { xPercent: 100 },
          { xPercent: 0, duration, ease: "power3.inOut" },
        )
        .fromTo(
          scrim,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration, ease: "power2.out" },
          0,
        )
        .fromTo(
          items,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration * 0.65,
            stagger: duration * 0.14,
            ease: "power2.out",
          },
          duration * 0.55,
        );
    },
    { scope: rootRef, dependencies: [isMounted], revertOnUpdate: true },
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (isOpen) timeline.play();
    else timeline.reverse();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  if (!isMounted) return null;

  const hasLines = Boolean(cart && cart.lines.length > 0);

  return (
    // z-50 sits above the header, so the panel carries its own CLOSE
    <div
      ref={rootRef}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      inert={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label={t("drawerTitle")}
    >
      {/* Dims the page behind and closes on click; pre-hidden so it never flashes */}
      <button
        type="button"
        data-cart-scrim
        tabIndex={-1}
        aria-label={t("closeCart")}
        onClick={close}
        className="invisible absolute inset-0 cursor-default bg-black/25"
      />

      {/*
       * Full width on a phone; from sm up a fifth-ish of the screen, floored at 26rem so a line
       * item never gets cramped. No translate utility to pre-hide it — see menu-overlay.tsx.
       */}
      <div
        data-cart-panel
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-surface sm:w-[max(26rem,22vw)]"
      >
        <div
          data-cart-item
          className="flex h-16 shrink-0 items-center justify-between px-6 sm:px-8"
        >
          <h2 className="font-sans text-xs font-medium uppercase tracking-[0.24em] text-text sm:text-sm">
            {t("drawerTitle")}{" "}
            <span className="font-normal tabular-nums tracking-normal">
              ({cart?.totalQuantity ?? 0})
            </span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("closeCart")}
            className="cursor-pointer font-sans text-xs font-medium uppercase tracking-[0.25em] text-text transition hover:opacity-60 sm:text-sm"
          >
            {tNav("close")}
          </button>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col px-6 pt-4 sm:px-8">
          {/*
            The list scrolls inside the drawer's side padding, so the scrollbar is pushed out
            into that padding (-mr/pr) and its gutter is always reserved: it never sits over
            the trash icons, and the lines do not shift when it appears.
          */}
          <div
            data-cart-item
            className="-mr-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden divide-y divide-border pr-4 [scrollbar-gutter:stable]"
          >
            {isLoading ? (
              <p className="py-8 font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
                {t("loading")}
              </p>
            ) : hasLines ? (
              cart?.lines.map((line) => <CartLineItem key={line.id} line={line} />)
            ) : (
              <p className="py-8 font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
                {t("empty")}
              </p>
            )}
          </div>

          <div data-cart-item className="shrink-0 border-t border-border py-8">
            {cart && hasLines ? (
              <div className="mb-8 flex items-center justify-between">
                <span className={cn(TEXT_LINK_CLASS, "text-text-muted")}>
                  {t("subtotal")}
                </span>
                <Price
                  amount={cart.cost.subtotalAmount.amount}
                  currencyCode={cart.cost.subtotalAmount.currencyCode}
                  className="font-sans text-sm font-normal uppercase tracking-[0.12em] text-text sm:text-base"
                />
              </div>
            ) : null}

            <div className="flex items-end justify-end gap-6">
              {hasLines ? (
                <Link
                  href="/summary"
                  onClick={close}
                  className={cn(TEXT_LINK_CLASS, TEXT_LINK_ACTIVE, "hover:opacity-60")}
                >
                  {t("checkout")}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
