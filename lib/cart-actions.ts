"use server";

import { cookies } from "next/headers";
import {
  createCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  type Cart,
} from "@/lib/api";

const CART_TOKEN_KEY = "cart-token";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

async function getCartToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_TOKEN_KEY)?.value ?? null;
}

async function ensureCartToken(): Promise<string> {
  const existing = await getCartToken();
  if (existing) return existing;

  const { token } = await createCart();
  if (!token) throw new Error("Failed to create cart: no token returned");

  const cookieStore = await cookies();
  cookieStore.set(CART_TOKEN_KEY, token, COOKIE_OPTS);
  return token;
}

export async function addItemToCart(
  productId: string,
  quantity: number = 1
): Promise<Cart> {
  const token = await ensureCartToken();
  return apiAddToCart(token, productId, quantity);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<Cart> {
  const token = await ensureCartToken();
  return apiUpdateCartItem(token, itemId, quantity);
}

export async function removeItem(itemId: string): Promise<Cart> {
  const token = await ensureCartToken();
  return apiRemoveCartItem(token, itemId);
}
