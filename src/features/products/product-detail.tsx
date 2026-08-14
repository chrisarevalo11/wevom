"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import type { ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils/cn";

type ProductGalleryProps = {
  product: ShopifyProduct;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const images =
    product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border",
                index === activeIndex
                  ? "border-brand"
                  : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? product.title}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type AddToCartButtonProps = {
  variantId: string;
  disabled?: boolean;
};

export function AddToCartButton({ variantId, disabled }: AddToCartButtonProps) {
  const t = useTranslations("product");
  const addToCart = useAddToCart();

  return (
    <Button
      className="w-full"
      disabled={disabled || addToCart.isPending}
      onClick={() => addToCart.mutate({ merchandiseId: variantId })}
    >
      {addToCart.isPending ? t("adding") : t("addToCart")}
    </Button>
  );
}

type ProductPurchasePanelProps = {
  product: ShopifyProduct;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
        {selectedVariant ? (
          <Price
            amount={selectedVariant.price.amount}
            currencyCode={selectedVariant.price.currencyCode}
            className="mt-3 text-xl"
          />
        ) : null}
      </div>

      {product.options.length > 0 && product.variants.length > 1 ? (
        <div className="space-y-4">
          {product.options.map((option) => (
            <div key={option.name}>
              <p className="mb-2 text-sm font-medium">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const matchingVariant = product.variants.find((variant) =>
                    variant.selectedOptions.some(
                      (selected) =>
                        selected.name === option.name && selected.value === value,
                    ),
                  );

                  if (!matchingVariant) return null;

                  const isSelected = selectedVariantId === matchingVariant.id;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedVariantId(matchingVariant.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition",
                        isSelected
                          ? "border-brand bg-brand text-white"
                          : "border-border hover:bg-surface-muted",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {selectedVariant ? (
        <AddToCartButton
          variantId={selectedVariant.id}
          disabled={!selectedVariant.availableForSale}
        />
      ) : null}

      <div
        className="prose prose-neutral max-w-none text-sm text-text-muted"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />
    </div>
  );
}
