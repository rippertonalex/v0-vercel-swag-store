"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  useCallback,
  type ReactNode,
} from "react";
import type { Cart } from "@/lib/api";
import {
  addItemToCart,
  updateItemQuantity,
  removeItem,
} from "@/lib/cart-actions";

interface CartContextValue {
  cart: Cart | null;
  isPending: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: Cart | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, setOptimisticCart] = useOptimistic<Cart | null>(
    initialCart
  );

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      startTransition(async () => {
        // Optimistic: increment totalItems
        if (optimisticCart) {
          setOptimisticCart({
            ...optimisticCart,
            totalItems: optimisticCart.totalItems + quantity,
          });
        }
        await addItemToCart(productId, quantity);
      });
    },
    [optimisticCart, setOptimisticCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      startTransition(async () => {
        if (optimisticCart) {
          const item = optimisticCart.items.find(
            (i) => i.productId === itemId
          );
          if (item) {
            const diff = quantity - item.quantity;
            setOptimisticCart({
              ...optimisticCart,
              totalItems: optimisticCart.totalItems + diff,
              items: optimisticCart.items.map((i) =>
                i.productId === itemId
                  ? {
                      ...i,
                      quantity,
                      lineTotal: i.product.price * quantity,
                    }
                  : i
              ),
              subtotal: optimisticCart.subtotal + diff * item.product.price,
            });
          }
        }
        await updateItemQuantity(itemId, quantity);
      });
    },
    [optimisticCart, setOptimisticCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      startTransition(async () => {
        if (optimisticCart) {
          const item = optimisticCart.items.find(
            (i) => i.productId === itemId
          );
          if (item) {
            setOptimisticCart({
              ...optimisticCart,
              totalItems: optimisticCart.totalItems - item.quantity,
              items: optimisticCart.items.filter(
                (i) => i.productId !== itemId
              ),
              subtotal: optimisticCart.subtotal - item.lineTotal,
            });
          }
        }
        await removeItem(itemId);
      });
    },
    [optimisticCart, setOptimisticCart]
  );

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isPending,
        addToCart,
        updateQuantity,
        removeFromCart,
        totalItems: optimisticCart?.totalItems ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
