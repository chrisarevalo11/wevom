"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { consumeCompletedCartAction } from "@/lib/shopify/actions";

/**
 * The "thank you" the site shows when a buyer lands back from Shopify's checkout. Mounted once
 * in the root layout: on the first page load it asks the server whether the cart in the
 * cookie has been consumed by an order, and if so says thanks and lets the cart start over.
 *
 * Shopify's own order confirmation (and the email) remain the receipt; this is the site
 * picking the visitor back up, not a second confirmation.
 */
export function OrderCompleteNotice() {
  const t = useTranslations("orderComplete");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    consumeCompletedCartAction(document.referrer).then((completed) => {
      if (cancelled || !completed) return;
      // The drawer may have cached the gone cart as empty already; make sure it agrees
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

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
