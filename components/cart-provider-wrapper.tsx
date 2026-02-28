import { Suspense } from "react";
import { CartProvider } from "@/lib/cart-context";
import { fetchCart } from "@/lib/cart-actions";
import type { ReactNode } from "react";

async function CartProviderWithData({ children }: { children: ReactNode }) {
  const cart = await fetchCart();
  return <CartProvider initialCart={cart}>{children}</CartProvider>;
}

export function CartProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <CartProvider initialCart={null}>{children}</CartProvider>
      }
    >
      <CartProviderWithData>{children}</CartProviderWithData>
    </Suspense>
  );
}
