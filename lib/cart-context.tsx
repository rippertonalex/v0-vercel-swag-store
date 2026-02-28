"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import useSWR from "swr";
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

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()).then((data) => data.cart as Cart | null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: cart, isValidating, mutate } = useSWR("/api/cart", fetcher, {
    revalidateOnFocus: false,
  });

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      const currentCart = cart ?? null;
      // Optimistic update
      if (currentCart) {
        mutate(
          {
            ...currentCart,
            totalItems: currentCart.totalItems + quantity,
          },
          false
        );
      }
      await addItemToCart(productId, quantity);
      mutate();
    },
    [cart, mutate]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const currentCart = cart ?? null;
      if (currentCart) {
        const item = currentCart.items.find((i) => i.productId === itemId);
        if (item) {
          const diff = quantity - item.quantity;
          mutate(
            {
              ...currentCart,
              totalItems: currentCart.totalItems + diff,
              items: currentCart.items.map((i) =>
                i.productId === itemId
                  ? { ...i, quantity, lineTotal: i.product.price * quantity }
                  : i
              ),
              subtotal: currentCart.subtotal + diff * item.product.price,
            },
            false
          );
        }
      }
      await updateItemQuantity(itemId, quantity);
      mutate();
    },
    [cart, mutate]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const currentCart = cart ?? null;
      if (currentCart) {
        const item = currentCart.items.find((i) => i.productId === itemId);
        if (item) {
          mutate(
            {
              ...currentCart,
              totalItems: currentCart.totalItems - item.quantity,
              items: currentCart.items.filter((i) => i.productId !== itemId),
              subtotal: currentCart.subtotal - item.lineTotal,
            },
            false
          );
        }
      }
      await removeItem(itemId);
      mutate();
    },
    [cart, mutate]
  );

  return (
    <CartContext.Provider
      value={{
        cart: cart ?? null,
        isPending: isValidating,
        addToCart,
        updateQuantity,
        removeFromCart,
        totalItems: cart?.totalItems ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
