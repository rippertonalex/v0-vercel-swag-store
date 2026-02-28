import { getCachedProduct } from "@/lib/api-server";
import type { Cart, CartItemWithProduct } from "@/lib/api";

export interface CartEntry {
  productId: string;
  quantity: number;
  addedAt: string;
}

export async function buildCartFromEntries(
  entries: CartEntry[],
): Promise<Cart> {
  const items: CartItemWithProduct[] = (
    await Promise.all(
      entries.map(async (entry) => {
        try {
          const product = await getCachedProduct(entry.productId);
          return {
            productId: entry.productId,
            quantity: entry.quantity,
            addedAt: entry.addedAt,
            product,
            lineTotal: product.price * entry.quantity,
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter((item): item is CartItemWithProduct => item !== null);

  return {
    token: "local",
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    currency: "USD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
