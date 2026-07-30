import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import { ShopifySetupNotice } from "@/components/ui/shopify-setup-notice";
import { isShopifyConfigured } from "@/env";
import { getCartAction } from "@/lib/shopify/actions";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart and proceed to checkout.",
};

export default async function CartPage() {
  if (!isShopifyConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Cart</h1>
        <div className="mt-8">
          <ShopifySetupNotice />
        </div>
      </div>
    );
  }

  const cart = await getCartAction();

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-4 text-text-muted">
          Add products to your cart to continue to checkout.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight">Cart</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border">
          {cart.lines.map((line) => {
            const image =
              line.merchandise.image ?? line.merchandise.product.featuredImage;

            return (
              <div key={line.id} className="flex gap-4 py-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText ?? line.merchandise.product.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="font-medium hover:underline"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    <p className="text-sm text-text-muted">{line.merchandise.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Qty {line.quantity}</span>
                    <Price
                      amount={(
                        Number.parseFloat(line.merchandise.price.amount) * line.quantity
                      ).toFixed(2)}
                      currencyCode={line.merchandise.price.currencyCode}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-surface-muted p-6">
          <h2 className="text-lg font-medium">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <Price
                amount={cart.cost.subtotalAmount.amount}
                currencyCode={cart.cost.subtotalAmount.currencyCode}
              />
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <Price
                amount={cart.cost.totalAmount.amount}
                currencyCode={cart.cost.totalAmount.currencyCode}
              />
            </div>
          </div>

          <a
            href={cart.checkoutUrl}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Proceed to checkout
          </a>

          <p className="mt-4 text-xs text-text-muted">
            You will be redirected to Shopify&apos;s secure checkout to complete your
            purchase.
          </p>
        </aside>
      </div>
    </div>
  );
}
