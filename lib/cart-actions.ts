// Server Actions — called from client components like RPC endpoints.
// Cart uses cookies instead of external API because the API's Redis is down.
"use server";

import { cookies } from "next/headers";
import type { Cart } from "@/lib/api";
import { CART_COOKIE, buildCartFromEntries, type CartEntry } from "@/lib/cart-utils";

const MAX_CART_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

function validateQuantity(quantity: number): number {
  const q = Math.floor(Math.max(1, Math.min(quantity, MAX_ITEM_QUANTITY)));
  return Number.isFinite(q) ? q : 1;
}

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
  const safeQuantity = validateQuantity(quantity);
  const entries = await readEntries();
  const existing = entries.find((e) => e.productId === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + safeQuantity, MAX_ITEM_QUANTITY);
  } else {
    if (entries.length >= MAX_CART_ITEMS) {
      return buildCartFromEntries(entries);
    }
    entries.push({
      productId,
      quantity: safeQuantity,
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
    const safeQuantity = validateQuantity(quantity);
    const existing = entries.find((e) => e.productId === itemId);
    if (existing) {
      existing.quantity = safeQuantity;
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
