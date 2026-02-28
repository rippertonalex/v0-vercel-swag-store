import { cookies } from "next/headers";
import { buildCartFromEntries, type CartEntry } from "@/lib/cart-utils";

const CART_COOKIE = "cart-items";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;

  if (!raw) {
    return Response.json({ cart: null });
  }

  let entries: CartEntry[];
  try {
    entries = JSON.parse(raw);
  } catch {
    return Response.json({ cart: null });
  }

  if (entries.length === 0) {
    return Response.json({ cart: null });
  }

  const cart = await buildCartFromEntries(entries);
  return Response.json({ cart });
}
