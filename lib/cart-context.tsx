"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { toast } from "sonner";
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
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.cart as Cart | null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    data: cart,
    isValidating,
    mutate,
  } = useSWR(mounted ? "/api/cart" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      const previousCart = cart ?? null;
      if (previousCart) {
        mutate(
          { ...previousCart, totalItems: previousCart.totalItems + quantity },
          false,
        );
      }
      try {
        await addItemToCart(productId, quantity);
        mutate();
      } catch {
        mutate(previousCart, false);
        toast.error("Unable to add item to cart. Please try again.");
      }
    },
    [cart, mutate],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const previousCart = cart ?? null;
      if (previousCart) {
        const item = previousCart.items.find((i) => i.productId === itemId);
        if (item) {
          const diff = quantity - item.quantity;
          mutate(
            {
              ...previousCart,
              totalItems: previousCart.totalItems + diff,
              items: previousCart.items.map((i) =>
                i.productId === itemId
                  ? { ...i, quantity, lineTotal: i.product.price * quantity }
                  : i,
              ),
              subtotal: previousCart.subtotal + diff * item.product.price,
            },
            false,
          );
        }
      }
      try {
        await updateItemQuantity(itemId, quantity);
        mutate();
      } catch {
        mutate(previousCart, false);
        toast.error("Unable to update quantity. Please try again.");
      }
    },
    [cart, mutate],
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const previousCart = cart ?? null;
      if (previousCart) {
        const item = previousCart.items.find((i) => i.productId === itemId);
        if (item) {
          mutate(
            {
              ...previousCart,
              totalItems: previousCart.totalItems - item.quantity,
              items: previousCart.items.filter((i) => i.productId !== itemId),
              subtotal: previousCart.subtotal - item.lineTotal,
            },
            false,
          );
        }
      }
      try {
        await removeItem(itemId);
        mutate();
      } catch {
        mutate(previousCart, false);
        toast.error("Unable to remove item. Please try again.");
      }
    },
    [cart, mutate],
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
