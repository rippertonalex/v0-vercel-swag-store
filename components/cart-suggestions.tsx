"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Loader2, Eye, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useBrowsingHistory } from "@/lib/browsing-history";
import { formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface SuggestionProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image: string | null;
}

interface Suggestion {
  productId: string;
  reason: string;
  product: SuggestionProduct;
}

interface CartSuggestionsData {
  message: string | null;
  suggestions: Suggestion[];
  reminder: { slug: string; message: string } | null;
}

export function CartSuggestions({ onNavigate }: { onNavigate: () => void }) {
  const { cart, addToCart } = useCart();
  const { viewedProducts } = useBrowsingHistory();
  const [data, setData] = useState<CartSuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedFor, setFetchedFor] = useState<string>("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const cartKey = items.map((i) => `${i.productId}:${i.quantity}`).join(",");

  useEffect(() => {
    if (items.length === 0 || cartKey === fetchedFor) return;

    setLoading(true);
    setFetchedFor(cartKey);

    fetch("/api/ai/cart-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: items.map((i) => ({
          name: i.product.name,
          category: i.product.category,
          quantity: i.quantity,
        })),
        viewedProducts: viewedProducts
          .filter((v) => !items.some((i) => i.product.slug === v.slug))
          .map((v) => ({
            name: v.name,
            slug: v.slug,
            durationSeconds: Math.round(v.duration / 1000),
          })),
      }),
    })
      .then((res) => res.json())
      .then((d: CartSuggestionsData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [cartKey, items, viewedProducts, fetchedFor]);

  async function handleAddSuggestion(productId: string) {
    setAddingId(productId);
    await addToCart(productId, 1);
    setAddingId(null);
  }

  if (items.length === 0) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <Sparkles className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Thinking of suggestions...
        </span>
        <Loader2 className="size-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || (!data.message && data.suggestions.length === 0)) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
      {data.message && (
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {data.message}
          </p>
        </div>
      )}

      {data.suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            You might also like
          </span>
          {data.suggestions.map((s) => (
            <div
              key={s.productId}
              className="flex items-center gap-3 rounded-lg border border-border p-2"
            >
              {s.product.image && (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={s.product.image}
                    alt={s.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/products/${s.product.slug}`}
                  onClick={onNavigate}
                  className="line-clamp-1 text-xs font-medium text-foreground hover:underline"
                >
                  {s.product.name}
                </Link>
                <p className="text-[10px] text-muted-foreground">{s.reason}</p>
                <p className="text-xs font-medium text-foreground">
                  {formatPrice(s.product.price, s.product.currency)}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-7 shrink-0"
                disabled={addingId === s.productId}
                onClick={() => handleAddSuggestion(s.productId)}
                aria-label={`Add ${s.product.name} to cart`}
              >
                {addingId === s.productId ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Plus className="size-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {data.reminder && (
        <div className="flex items-start gap-2 rounded-md bg-secondary px-2.5 py-2">
          <Eye className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <Link
            href={`/products/${data.reminder.slug}`}
            onClick={onNavigate}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {data.reminder.message}
          </Link>
        </div>
      )}
    </div>
  );
}
