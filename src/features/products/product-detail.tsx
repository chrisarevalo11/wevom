"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  PRODUCT_HERO_ATTRIBUTE,
  PRODUCT_INFO_ATTRIBUTE,
} from "@/components/ui/product-transition-overlay";
import {
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import { cn } from "@/lib/utils/cn";
import { useComingSoonStore } from "@/stores/coming-soon-store";
import { useProductTransitionStore } from "@/stores/product-transition-store";

/** Carries the measured height of the phone info panel to the first image's CSS */
const INFO_HEIGHT_VAR = "--product-info-height";

/** The quantity stepper reads a step up from the rest of the panel, so the count is easy to see */
const STEPPER_TEXT = "text-base sm:text-lg";

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  available: boolean;
  /** Units in stock, or null when the store does not cap the quantity */
  maxQuantity: number | null;
  /** Option name → chosen value, e.g. { Talla: "M", Color: "Negro" } */
  selectedOptions: Record<string, string>;
};

/** What the detail page renders, normalised from the Shopify product */
export type ProductDetailView = {
  title: string;
  price: string;
  description: string;
  composition: string;
  care: string;
  options: ProductOption[];
  variants: ProductVariant[];
  images: { src: string; alt: string }[];
};

/** The variant whose options all equal the current picks, if the store sells that combination */
function findVariant(variants: ProductVariant[], picks: Record<string, string>) {
  return variants.find((variant) =>
    Object.entries(picks).every(
      ([name, value]) => variant.selectedOptions[name] === value,
    ),
  );
}

/**
 * The garment, its copy and the buy action.
 *
 * Rendered twice — once pinned to the bottom of the phone screen over the images, once in the
 * empty half of the desktop layout — so it is a component rather than markup inlined into
 * either.
 */
function ProductInfo({ product }: { product: ProductDetailView }) {
  const t = useTranslations("product");
  const addToCart = useAddToCart();
  const openComingSoon = useComingSoonStore((state) => state.open);
  // Start on the first purchasable combination so the page does not open on a struck-out one
  const [picks, setPicks] = useState<Record<string, string>>(
    () =>
      (product.variants.find((variant) => variant.available) ?? product.variants[0])
        ?.selectedOptions ?? {},
  );
  const [quantity, setQuantity] = useState(1);

  const variant = findVariant(product.variants, picks);
  // A combination the store does not sell counts as sold out; no variants at all means the
  // product is not purchasable yet and the buy button opens the coming-soon modal instead
  const soldOut = product.variants.length > 0 && variant?.available !== true;
  const max = variant?.maxQuantity ?? null;
  const atMax = max !== null && quantity >= max;

  const pick = (name: string, value: string) => {
    const next = { ...picks, [name]: value };
    setPicks(next);
    // The new combination may hold fewer units than the count already chosen
    const limit = findVariant(product.variants, next)?.maxQuantity;
    if (limit) setQuantity((count) => Math.min(count, limit));
  };

  // A value is offered when some purchasable variant pairs it with the other current picks
  const isOffered = (name: string, value: string) =>
    product.variants.some(
      (candidate) =>
        candidate.available &&
        candidate.selectedOptions[name] === value &&
        Object.entries(picks).every(
          ([other, chosen]) =>
            other === name || candidate.selectedOptions[other] === chosen,
        ),
    );

  const onAddToCart = () => {
    // No variant means the product is not purchasable yet, so the step defers
    if (!variant) {
      openComingSoon();
      return;
    }

    addToCart.mutate({ merchandiseId: variant.id, quantity });
  };

  return (
    // No background of its own: on a phone the bar it sits in draws the white, so the copy can
    // fade in over a panel that is already there. On desktop it sits on the page itself.
    <div className="p-5 sm:p-6 lg:p-0">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-text sm:text-sm">
            {product.title}
          </h1>
          <p className="font-sans text-xs tracking-wide text-text-muted">
            {product.description}
          </p>
          <p className="font-sans text-xs tracking-wide text-text-muted">
            {product.composition}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 text-right">
          <p className="font-sans text-sm uppercase tracking-[0.12em] text-text sm:text-base">
            {product.price}
          </p>

          {/* An option-less product has nothing to pick, but the visitor should still know why */}
          {product.options.length === 0 && product.variants.length > 0 && (
            <p className={cn(TEXT_LINK_CLASS, TEXT_LINK_ACTIVE)}>{t("oneSize")}</p>
          )}
          {product.options.map((option) => (
            <fieldset
              key={option.name}
              className="flex flex-wrap justify-end gap-x-3 gap-y-1"
            >
              <legend className="sr-only">{option.name}</legend>
              {option.values.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!isOffered(option.name, value)}
                  aria-pressed={picks[option.name] === value}
                  onClick={() => pick(option.name, value)}
                  className={cn(
                    TEXT_LINK_CLASS,
                    "cursor-pointer disabled:cursor-default disabled:line-through disabled:opacity-40",
                    picks[option.name] === value
                      ? TEXT_LINK_ACTIVE
                      : TEXT_LINK_INACTIVE,
                  )}
                >
                  {value}
                </button>
              ))}
            </fieldset>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label={t("decrease")}
            disabled={soldOut || quantity <= 1}
            onClick={() => setQuantity((count) => Math.max(1, count - 1))}
            className={cn(
              TEXT_LINK_CLASS,
              TEXT_LINK_INACTIVE,
              STEPPER_TEXT,
              "cursor-pointer disabled:cursor-default disabled:opacity-40",
            )}
          >
            −
          </button>
          <span
            aria-live="polite"
            className={cn(
              "min-w-[2ch] text-center font-sans tabular-nums text-text",
              STEPPER_TEXT,
            )}
          >
            {soldOut ? 0 : quantity}
          </span>
          <button
            type="button"
            aria-label={t("increase")}
            disabled={soldOut || atMax}
            onClick={() =>
              setQuantity((count) =>
                max === null ? count + 1 : Math.min(max, count + 1),
              )
            }
            className={cn(
              TEXT_LINK_CLASS,
              TEXT_LINK_INACTIVE,
              STEPPER_TEXT,
              "cursor-pointer disabled:cursor-default disabled:opacity-40",
            )}
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={addToCart.isPending || soldOut}
          onClick={onAddToCart}
          className={cn(
            TEXT_LINK_CLASS,
            "cursor-pointer text-text hover:opacity-60 disabled:cursor-default disabled:opacity-40",
          )}
        >
          {soldOut ? t("soldOut") : addToCart.isPending ? t("adding") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: ProductDetailView }) {
  const t = useTranslations("product");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openImage = openIndex === null ? null : product.images[openIndex];

  /*
   * A card is mid-flight towards this page. Its overlay is parked exactly where the first
   * image is about to land, so that image stays out of sight until the morph hands over —
   * otherwise it would be visible underneath for the whole travel. The info is held back too;
   * the overlay fades it in once the image has settled.
   */
  const isArriving = useProductTransitionStore((state) => state.pending !== null);

  /*
   * On a phone the first image takes whatever height the pinned info panel leaves, so the two
   * fill the screen between them. The panel's height depends on its copy and the size row's
   * wrapping, so it is measured and handed to CSS as a variable. A layout effect, so the
   * variable is in place before the first paint — and before a card's morph measures the
   * image it is about to land on.
   */
  const gridRef = useRef<HTMLDivElement>(null);
  const mobileInfoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const info = mobileInfoRef.current;
    if (!grid || !info) return;

    const sync = () => {
      grid.style.setProperty(INFO_HEIGHT_VAR, `${info.offsetHeight}px`);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(info);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/*
       * Pulled up by the header's h-16, which is sticky and so takes up room in the flow — the
       * first image starts at the very top of the viewport and runs behind the nav, rather than
       * being pushed 64px down and losing its bottom edge below the fold.
       */}
      <div ref={gridRef} className="-mt-16 grid grid-cols-1 lg:grid-cols-[60vw_1fr]">
        {/* Full width, no gap: the images are the page */}
        <div className="col-start-1 row-start-1 flex flex-col">
          {product.images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={image.alt}
              onClick={() => setOpenIndex(index)}
              // The first image is the one a card morphs into, and the only one the overlay
              // looks for
              {...(index === 0 ? { [PRODUCT_HERO_ATTRIBUTE]: "" } : {})}
              className={cn(
                "relative block w-full cursor-zoom-in",
                index === 0 && isArriving && "invisible",
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={1500}
                priority={index === 0}
                // The first image is the box a card lands in, cropped to fit: on a phone the
                // screen above the pinned info panel, on desktop the full viewport height of its
                // column. The rest keep their own proportions below it
                className={cn(
                  "h-auto w-full object-cover",
                  index === 0 &&
                    "h-[calc(100svh-var(--product-info-height,0px))] lg:h-screen",
                )}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </button>
          ))}
        </div>

        {/*
         * Phone: placed after the images in the flow, and sticky to the bottom edge, full bleed
         * — a bar across the foot of the screen rather than a floating card. While its
         * own spot is still below the fold it floats over the images as they scroll past;
         * once the last image has fully gone by, it settles into that spot under them — on the
         * page's own background, which its bg-surface matches, so it reads as part of the page.
         * Sticky elements are bounded by the grid, not their row, which is what lets it ride
         * the whole column. The top padding is the breathing room after the last image; the
         * wrapper is click-through so that strip never swallows a tap meant for an image.
         */}
        <div className="pointer-events-none sticky bottom-0 col-start-1 row-start-2 pt-10 lg:hidden">
          {/*
           * Edge to edge and down to the bottom, clear of the home indicator. The white bar is
           * up from the start — only the copy inside waits for a card's morph — or the second
           * image would show through the empty space under the first while it lands.
           */}
          <div
            ref={mobileInfoRef}
            className="pointer-events-auto bg-surface pb-[env(safe-area-inset-bottom)]"
          >
            <div
              {...{ [PRODUCT_INFO_ATTRIBUTE]: "" }}
              className={cn(isArriving && "invisible")}
            >
              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        {/*
         * Desktop: its own column, held in place while the images scroll beside it. One
         * viewport tall and flex-centred, so it sits level with the middle of the first image.
         */}
        <div className="hidden lg:col-start-2 lg:row-start-1 lg:block">
          <div
            {...{ [PRODUCT_INFO_ATTRIBUTE]: "" }}
            className={cn(
              "sticky top-0 flex h-screen flex-col justify-center px-10 xl:px-16",
              isArriving && "invisible",
            )}
          >
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {openImage ? (
        <ImageLightbox
          src={openImage.src}
          alt={openImage.alt}
          closeLabel={t("closeImage")}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}
