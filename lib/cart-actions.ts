"use server";

import { cookies } from "next/headers";
import {
  createCart,
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  type Cart,
} from "@/lib/api";

const CART_TOKEN_KEY = "cart-token";

async function getOrCreateCartToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_TOKEN_KEY)?.value;

  if (!token) {
    const { token: newToken } = await createCart();
    token = newToken;
    cookieStore.set(CART_TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }

  return token;
}

export async function fetchCart(): Promise<Cart | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_TOKEN_KEY)?.value;
  if (!token) return null;

  try {
    return await getCart(token);
  } catch {
    return null;
  }
}

export async function addItemToCart(
  productId: string,
  quantity: number = 1
): Promise<Cart> {
  const token = await getOrCreateCartToken();
  return apiAddToCart(token, productId, quantity);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<Cart> {
  const token = await getOrCreateCartToken();
  return apiUpdateCartItem(token, itemId, quantity);
}

export async function removeItem(itemId: string): Promise<Cart> {
  const token = await getOrCreateCartToken();
  return apiRemoveCartItem(token, itemId);
}
