"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/api";

interface AiSearchResponse {
  productIds: string[];
  reasoning: string;
}

export function AiSearchResults({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [result, setResult] = useState<AiSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2 || query === lastQuery) return;

    setLoading(true);
    setLastQuery(query);

    fetch("/api/ai/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data: AiSearchResponse) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [query, lastQuery]);

  if (!query) return null;

  if (loading) {
    return (
      <div className="mt-8 border-t border-border pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            AI is finding matches...
          </span>
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!result || result.productIds.length === 0) return null;

  const matched = result.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== null && p !== undefined);

  if (matched.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">
          AI Recommendations
        </span>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          AI
        </span>
      </div>
      {result.reasoning && (
        <p className="mb-4 text-sm text-muted-foreground">
          {result.reasoning}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matched.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
