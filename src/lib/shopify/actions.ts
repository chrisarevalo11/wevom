"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SHOPIFY_CART_COOKIE } from "@/config/site";
import { isShopifyConfigured } from "@/env";
import { getShopifyClient } from "./client";
import { getCart, type ShopifyCart } from "./index";
import {
  cartCreateMutation,
  cartLinesAddMutation,
  cartLinesRemoveMutation,
  cartLinesUpdateMutation,
} from "./mutations";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

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
  revalidatePath("/cart");
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
