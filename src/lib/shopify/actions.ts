"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SHOPIFY_CART_COOKIE } from "@/config/site";
import { isShopifyConfigured } from "@/env";
import { getShopifyClient } from "./client";
import { getCart, type ShopifyCart } from "./index";
import {
  cartBuyerIdentityUpdateMutation,
  cartCreateMutation,
  cartDeliveryAddressesAddMutation,
  cartDeliveryAddressesRemoveMutation,
  cartLinesAddMutation,
  cartLinesRemoveMutation,
  cartLinesUpdateMutation,
} from "./mutations";
import { getCartDeliveryAddressesQuery } from "./queries";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Shopify never refuses an out-of-stock line: it adds it at quantity 0 and reports a warning.
 * A zero line is useless to the visitor, so the add is treated as failed and the line removed.
 */
const OUT_OF_STOCK = "MERCHANDISE_OUT_OF_STOCK";

type CartWarning = { code: string; message: string };

async function dropZeroLines(cartId: string) {
  const cart = await getCart(cartId);
  const lineIds = cart?.lines
    .filter((line) => line.quantity === 0)
    .map((line) => line.id);
  if (!lineIds || lineIds.length === 0) return;
  await getShopifyClient().request(cartLinesRemoveMutation, {
    variables: { cartId, lineIds },
  });
}

async function rejectOutOfStock(
  cartId: string,
  warnings: CartWarning[] | undefined,
): Promise<string | undefined> {
  const warning = warnings?.find((entry) => entry.code === OUT_OF_STOCK);
  if (!warning) return undefined;
  await dropZeroLines(cartId);
  return warning.message;
}

async function persistCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SHOPIFY_CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
  });
}

async function getCartIdFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
}

function revalidateCartPaths() {
  // The cart only renders in the drawer, which lives in the root layout
  revalidatePath("/", "layout");
}

export async function getCartAction(): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured()) return null;

  const cartId = await getCartIdFromCookie();
  if (!cartId) return null;

  return getCart(cartId);
}

export async function addToCartAction(
  merchandiseId: string,
  quantity = 1,
): Promise<{ cart: ShopifyCart | null; error?: string }> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  try {
    const client = getShopifyClient();
    const cartId = await getCartIdFromCookie();

    if (!cartId) {
      const { data, errors } = await client.request(cartCreateMutation, {
        variables: {
          input: {
            lines: [{ merchandiseId, quantity }],
          },
        },
      });

      if (errors) {
        return { cart: null, error: errors.message ?? "Failed to create cart" };
      }

      const newCartId = data?.cartCreate?.cart?.id;
      if (!newCartId) {
        const userError = data?.cartCreate?.userErrors?.[0]?.message;
        return { cart: null, error: userError ?? "Failed to create cart" };
      }

      await persistCartId(newCartId);
      revalidateCartPaths();

      const outOfStock = await rejectOutOfStock(newCartId, data?.cartCreate?.warnings);
      if (outOfStock) return { cart: await getCart(newCartId), error: outOfStock };

      return { cart: await getCart(newCartId) };
    }

    const { data, errors } = await client.request(cartLinesAddMutation, {
      variables: {
        cartId,
        lines: [{ merchandiseId, quantity }],
      },
    });

    if (errors) {
      return { cart: null, error: errors.message ?? "Failed to add to cart" };
    }

    const userError = data?.cartLinesAdd?.userErrors?.[0]?.message;
    if (userError) {
      return { cart: null, error: userError };
    }

    revalidateCartPaths();

    const outOfStock = await rejectOutOfStock(cartId, data?.cartLinesAdd?.warnings);
    if (outOfStock) return { cart: await getCart(cartId), error: outOfStock };

    return { cart: await getCart(cartId) };
  } catch (error) {
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to add to cart",
    };
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<{ cart: ShopifyCart | null; error?: string }> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return { cart: null, error: "Cart not found." };
  }

  try {
    const client = getShopifyClient();
    const { data, errors } = await client.request(cartLinesUpdateMutation, {
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    });

    if (errors) {
      return { cart: null, error: errors.message ?? "Failed to update cart" };
    }

    const userError = data?.cartLinesUpdate?.userErrors?.[0]?.message;
    if (userError) {
      return { cart: null, error: userError };
    }

    revalidateCartPaths();
    return { cart: await getCart(cartId) };
  } catch (error) {
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to update cart",
    };
  }
}

export async function removeCartLineAction(
  lineId: string,
): Promise<{ cart: ShopifyCart | null; error?: string }> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return { cart: null, error: "Cart not found." };
  }

  try {
    const client = getShopifyClient();
    const { data, errors } = await client.request(cartLinesRemoveMutation, {
      variables: {
        cartId,
        lineIds: [lineId],
      },
    });

    if (errors) {
      return { cart: null, error: errors.message ?? "Failed to remove item" };
    }

    const userError = data?.cartLinesRemove?.userErrors?.[0]?.message;
    if (userError) {
      return { cart: null, error: userError };
    }

    revalidateCartPaths();
    return { cart: await getCart(cartId) };
  } catch (error) {
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to remove item",
    };
  }
}

export type ShippingDetails = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  provinceCode: string;
  zip: string;
};

/** The shop ships inside Colombia only, so the address never carries another country */
const SHIPPING_COUNTRY = "CO";

/**
 * Stores the visitor's contact and delivery address on the cart so Shopify's checkout opens
 * with them already filled in. Shipping rates and payment stay on Shopify: the Storefront API
 * cannot take a payment, and rates depend on the address Shopify validates at checkout.
 *
 * The cart keeps one selected address: any address stored by an earlier visit is removed
 * first, so re-submitting the form replaces it instead of piling up alternatives.
 */
export async function setShippingDetailsAction(
  details: ShippingDetails,
): Promise<{ checkoutUrl: string | null; error?: string }> {
  if (!isShopifyConfigured()) {
    return { checkoutUrl: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return { checkoutUrl: null, error: "Cart not found." };
  }

  try {
    const client = getShopifyClient();

    const identity = await client.request(cartBuyerIdentityUpdateMutation, {
      variables: {
        cartId,
        buyerIdentity: {
          email: details.email,
          phone: details.phone || undefined,
          countryCode: SHIPPING_COUNTRY,
        },
      },
    });
    const identityError =
      identity.errors?.message ??
      identity.data?.cartBuyerIdentityUpdate?.userErrors?.[0]?.message;
    if (identityError) return { checkoutUrl: null, error: identityError };

    const existing = await client.request(getCartDeliveryAddressesQuery, {
      variables: { cartId },
    });
    const addressIds =
      existing.data?.cart?.delivery?.addresses.map((entry) => entry.id) ?? [];
    if (addressIds.length > 0) {
      await client.request(cartDeliveryAddressesRemoveMutation, {
        variables: { cartId, addressIds },
      });
    }

    const added = await client.request(cartDeliveryAddressesAddMutation, {
      variables: {
        cartId,
        addresses: [
          {
            selected: true,
            address: {
              deliveryAddress: {
                firstName: details.firstName,
                lastName: details.lastName,
                address1: details.address1,
                address2: details.address2 || undefined,
                city: details.city,
                provinceCode: details.provinceCode,
                zip: details.zip || undefined,
                phone: details.phone || undefined,
                countryCode: SHIPPING_COUNTRY,
              },
            },
          },
        ],
      },
    });
    const addError =
      added.errors?.message ??
      added.data?.cartDeliveryAddressesAdd?.userErrors?.[0]?.message;
    if (addError) return { checkoutUrl: null, error: addError };

    revalidateCartPaths();
    return {
      checkoutUrl: added.data?.cartDeliveryAddressesAdd?.cart?.checkoutUrl ?? null,
    };
  } catch (error) {
    return {
      checkoutUrl: null,
      error: error instanceof Error ? error.message : "Failed to save shipping details",
    };
  }
}
