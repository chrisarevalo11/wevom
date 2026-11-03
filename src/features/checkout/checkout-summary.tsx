"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Price } from "@/components/ui/price";
import {
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { CartLineItem } from "@/features/cart/cart-drawer";
import { useCartQuery } from "@/features/cart/hooks/use-cart-query";
import { cn } from "@/lib/utils/cn";
import { SHIPPING_FORM_ID, ShippingForm } from "./shipping-form";

type Step = "items" | "shipping";
const STEPS: Step[] = ["items", "shipping"];

const MUTED = "font-sans text-xs uppercase tracking-[0.24em] text-text-muted";

/** The one large action on the page, a filled bar rather than a text link */
const BIG_BUTTON =
  "w-full cursor-pointer bg-text py-4 font-sans text-xs font-medium uppercase tracking-[0.28em] text-surface transition hover:opacity-80 disabled:cursor-default disabled:opacity-40 sm:text-sm";

/**
 * The cart review and the shipping form on the left, the total and the main action pinned on
 * the right. Payment
 * (and the shipping rate, which Shopify computes from the address) happens on Shopify's
 * checkout, which the form hands over to with the address already filled in.
 */
export function CheckoutSummary() {
  const t = useTranslations("summary");
  const { data: cart, isLoading } = useCartQuery();
  const [step, setStep] = useState<Step>("items");
  // Mirrors the form's pending state so the big button on the right can lock with it
  const [submitting, setSubmitting] = useState(false);

  const hasLines = Boolean(cart && cart.lines.length > 0);
  // A line Shopify kept at quantity 0 (stock ran out) cannot be checked out
  const canContinue = hasLines && cart?.lines.every((line) => line.quantity > 0);

  return (
    // Tucked under the sticky header (h-16) so the aside starts at the top of the viewport:
    // otherwise it scrolls those first 4rem before top-0 catches it. The section's top
    // padding keeps its own content clear of the header.
    <div className="-mt-16 lg:flex lg:items-start">
      <section className="px-5 pt-28 pb-16 sm:px-8 lg:min-h-dvh lg:w-3/5 lg:px-12 lg:pt-32">
        <Stepper step={step} />

        {isLoading ? (
          <p className={cn(MUTED, "mt-12")}>{t("loading")}</p>
        ) : !hasLines ? (
          <div className="mt-12 space-y-6">
            <p className={MUTED}>{t("empty")}</p>
            <Link
              href="/products"
              className={cn(TEXT_LINK_CLASS, TEXT_LINK_ACTIVE, "hover:opacity-60")}
            >
              {t("browse")}
            </Link>
          </div>
        ) : step === "items" ? (
          <div className="mt-8">
            <div className="divide-y divide-border border-b border-border">
              {cart?.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <ShippingForm onBusyChange={setSubmitting} />
          </div>
        )}
      </section>

      {/*
       * The order total and the one action that moves the flow on. Pinned for the page's full
       * height on desktop, centred in its column; on a phone it docks to the bottom edge so
       * the button is always within thumb reach while the list scrolls under it.
       */}
      {hasLines && !isLoading ? (
        <aside className="sticky bottom-0 z-10 border-t border-border bg-surface px-5 py-6 sm:px-8 lg:top-0 lg:flex lg:h-dvh lg:w-2/5 lg:items-center lg:justify-center lg:border-t-0 lg:border-l lg:px-12">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="flex items-baseline justify-between">
              <span className={cn(TEXT_LINK_CLASS, "text-text-muted")}>
                {t("subtotal")}
              </span>
              {cart ? (
                <Price
                  amount={cart.cost.subtotalAmount.amount}
                  currencyCode={cart.cost.subtotalAmount.currencyCode}
                  className="font-sans text-lg font-normal uppercase tracking-[0.12em] text-text sm:text-xl"
                />
              ) : null}
            </div>
            <p className="font-sans text-xs tracking-wide text-text-muted">
              {t("shippingNote")}
            </p>

            {step === "items" ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep("shipping")}
                className={BIG_BUTTON}
              >
                {t("continue")}
              </button>
            ) : (
              // Submits the form on the left from here: the button and the form are linked
              // by id, so it is a real submit, with the browser's own validation
              <button
                type="submit"
                form={SHIPPING_FORM_ID}
                disabled={submitting}
                className={BIG_BUTTON}
              >
                {submitting ? t("shipping.redirecting") : t("shipping.submit")}
              </button>
            )}
            {/*
             * Rendered on both steps and only shown on the second: the panel is centred in its
             * column, so a link that appeared from nowhere would shift everything above it.
             */}
            <button
              type="button"
              disabled={submitting || step === "items"}
              aria-hidden={step === "items"}
              tabIndex={step === "items" ? -1 : undefined}
              onClick={() => setStep("items")}
              className={cn(
                TEXT_LINK_CLASS,
                TEXT_LINK_INACTIVE,
                "block w-full cursor-pointer text-center disabled:cursor-default disabled:opacity-40",
                step === "items" && "invisible",
              )}
            >
              {t("shipping.back")}
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

/** Two numbered steps, read-only: the Continue and Back buttons are the only way between them */
function Stepper({ step }: { step: Step }) {
  const t = useTranslations("summary.steps");

  return (
    <ol className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
      {STEPS.map((entry, index) => (
        <li
          key={entry}
          aria-current={entry === step ? "step" : undefined}
          className={cn(
            TEXT_LINK_CLASS,
            entry === step ? TEXT_LINK_ACTIVE : TEXT_LINK_INACTIVE,
          )}
        >
          <span className="mr-3 tabular-nums">0{index + 1}</span>
          {t(entry)}
        </li>
      ))}
    </ol>
  );
}
