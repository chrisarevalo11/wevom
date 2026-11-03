"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  clearCartAfterOrderAction,
  consumeCompletedCartAction,
} from "@/lib/shopify/actions";

/**
 * The query flag Shopify's thank-you page comes back with, added by the storefront theme's
 * bounce when the buyer arrives from the order confirmation. Read and then removed from the
 * address bar, so a reload or a shared link does not repeat the thanks.
 */
export const ORDER_COMPLETE_PARAM = "order";
const ORDER_COMPLETE_VALUE = "complete";

/**
 * The "thank you" the site shows when a buyer lands back from Shopify's checkout. Mounted once
 * in the root layout. Two signals, either is enough: the order flag in the URL, which the
 * thank-you page's "continue shopping" carries, or a cart in the cookie that Shopify has
 * consumed by an order. On either the cookie is dropped so the cart starts over.
 *
 * Shopify's own order confirmation (and the email) remain the receipt; this is the site
 * picking the visitor back up, not a second confirmation.
 */
export function OrderCompleteNotice() {
  const t = useTranslations("orderComplete");
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    const url = new URL(window.location.href);
    const flagged = url.searchParams.get(ORDER_COMPLETE_PARAM) === ORDER_COMPLETE_VALUE;
    const check = flagged
      ? clearCartAfterOrderAction()
      : consumeCompletedCartAction(document.referrer);
    check.then((completed) => {
      if (cancelled) return;
      if (flagged) {
        // Through the router, so the refresh the action triggers does not put it back
        url.searchParams.delete(ORDER_COMPLETE_PARAM);
        router.replace(`${pathname}${url.search}`, { scroll: false });
      }
      if (!completed) return;
      // The cart is gone: drop whatever the drawer fetched meanwhile, and anything still
      // in flight, rather than asking Shopify about a cart the cookie no longer names
      queryClient.cancelQueries({ queryKey: ["cart"] });
      queryClient.setQueryData(["cart"], null);
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient, router, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  // Same stacking as the coming-soon dialog: above the header and the menu
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-text/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm border border-border bg-surface px-6 py-10 text-center sm:max-w-md sm:px-10">
        <h2
          id="order-complete-title"
          className="font-sans text-sm leading-relaxed uppercase tracking-[0.12em] text-text sm:text-base"
        >
          {t("title")}
        </h2>
        <p className="mt-4 font-sans text-xs leading-relaxed tracking-wide text-text-muted">
          {t("body")}
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          className="mt-8 cursor-pointer font-sans text-xs uppercase tracking-[0.28em] text-text-muted transition hover:text-text"
        >
          <span aria-hidden>·&nbsp;</span>
          {t("close")}
          <span aria-hidden>&nbsp;·</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
