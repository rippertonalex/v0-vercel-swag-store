"use client";

import { useState } from "react";
import useSWR from "swr";
import { Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

interface StockInfo {
  productId: string;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.stock as StockInfo | null);

export function AddToCartForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const { addToCart, isPending } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { data: stock } = useSWR<StockInfo | null>(
    `/api/stock/${productSlug}`,
    fetcher
  );

  const maxQuantity = stock?.stock ?? 0;
  const outOfStock = stock !== null && !stock.inStock;

  async function handleAddToCart() {
    await addToCart(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-none rounded-l-md"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || outOfStock}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>
          <span className="flex min-w-[3rem] items-center justify-center text-sm font-medium text-foreground">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-none rounded-r-md"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity || outOfStock}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={outOfStock || isPending || stock === null}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Adding...
          </>
        ) : added ? (
          "Added to Cart!"
        ) : outOfStock ? (
          "Out of Stock"
        ) : (
          <>
            <ShoppingBag className="size-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
