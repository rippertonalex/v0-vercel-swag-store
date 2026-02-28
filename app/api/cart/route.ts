import { cookies } from "next/headers";
import { getCart } from "@/lib/api";

const CART_TOKEN_KEY = "cart-token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_TOKEN_KEY)?.value;

  if (!token) {
    return Response.json({ cart: null });
  }

  try {
    const cart = await getCart(token);
    return Response.json({ cart });
  } catch {
    return Response.json({ cart: null });
  }
}
