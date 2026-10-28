"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BodySceneCanvas } from "@/components/three/body-scene-canvas";
import { Price } from "@/components/ui/price";
import {
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { CartLineItem } from "@/features/cart/cart-drawer";
import { useCartQuery } from "@/features/cart/hooks/use-cart-query";
import { cn } from "@/lib/utils/cn";
import { ShippingForm } from "./shipping-form";

type Step = "items" | "shipping";
const STEPS: Step[] = ["items", "shipping"];

const MUTED = "font-sans text-xs uppercase tracking-[0.24em] text-text-muted";

/**
 * The cart review and the shipping form on the left, the body pinned on the right. Payment
 * (and the shipping rate, which Shopify computes from the address) happens on Shopify's
 * checkout, which the form hands over to with the address already filled in.
 */
export function CheckoutSummary() {
  const t = useTranslations("summary");
  const { data: cart, isLoading } = useCartQuery();
  const [step, setStep] = useState<Step>("items");

  const hasLines = Boolean(cart && cart.lines.length > 0);
  // A line Shopify kept at quantity 0 (stock ran out) cannot be checked out
  const canContinue = hasLines && cart?.lines.every((line) => line.quantity > 0);

  return (
    // Tucked under the sticky header (h-16) so the aside starts at the top of the viewport:
    // otherwise it scrolls those first 4rem before top-0 catches it. The section's top
    // padding keeps its own content clear of the header.
    <div className="-mt-16 lg:flex">
      <section className="min-h-dvh px-5 pt-40 pb-16 sm:px-8 lg:w-3/5 lg:px-12 lg:pt-44">
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

            <div className="mt-8 flex items-center justify-between">
              <span className={cn(TEXT_LINK_CLASS, "text-text-muted")}>
                {t("subtotal")}
              </span>
              {cart ? (
                <Price
                  amount={cart.cost.subtotalAmount.amount}
                  currencyCode={cart.cost.subtotalAmount.currencyCode}
                  className="font-sans text-sm font-normal uppercase tracking-[0.12em] text-text sm:text-base"
                />
              ) : null}
            </div>
            <p className={cn(MUTED, "mt-2 normal-case tracking-wide")}>
              {t("shippingNote")}
            </p>

            <div className="mt-10 flex justify-end">
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep("shipping")}
                className={cn(
                  TEXT_LINK_CLASS,
                  TEXT_LINK_ACTIVE,
                  "cursor-pointer hover:opacity-60 disabled:cursor-default disabled:opacity-40",
                )}
              >
                {t("continue")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <ShippingForm onBack={() => setStep("items")} />
          </div>
        )}
      </section>

      {/*
       * Sticky for the page's full height; the canvas keeps the body centred in it. Only from
       * lg up: on a phone the list and the form need the whole width.
       */}
      <aside
        aria-hidden="true"
        className="pointer-events-none hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-2/5 lg:items-center lg:justify-center"
      >
        <div className="h-full w-full max-w-md">
          <BodySceneCanvas variant="hero" enableFloat showGradient={false} />
        </div>
      </aside>
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
