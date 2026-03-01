"use server";

import { cookies } from "next/headers";
import type { Cart } from "@/lib/api";
import { CART_COOKIE, buildCartFromEntries, type CartEntry } from "@/lib/cart-utils";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

async function readEntries(): Promise<CartEntry[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeEntries(entries: CartEntry[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(entries), COOKIE_OPTS);
}

export async function addItemToCart(
  productId: string,
  quantity: number = 1,
): Promise<Cart> {
  const entries = await readEntries();
  const existing = entries.find((e) => e.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    entries.push({
      productId,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  await writeEntries(entries);
  return buildCartFromEntries(entries);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<Cart> {
  let entries = await readEntries();

  if (quantity <= 0) {
    entries = entries.filter((e) => e.productId !== itemId);
  } else {
    const existing = entries.find((e) => e.productId === itemId);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  await writeEntries(entries);
  return buildCartFromEntries(entries);
}

export async function removeItem(itemId: string): Promise<Cart> {
  const entries = (await readEntries()).filter((e) => e.productId !== itemId);
  await writeEntries(entries);
  return buildCartFromEntries(entries);
}
