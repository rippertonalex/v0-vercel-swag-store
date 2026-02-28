"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

export function StockIndicator({ productSlug }: { productSlug: string }) {
  const { data: stock, isLoading: loading } = useSWR<StockInfo | null>(
    `/api/stock/${productSlug}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (loading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (!stock) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unavailable
      </Badge>
    );
  }

  if (!stock.inStock) {
    return (
      <Badge variant="destructive">Out of Stock</Badge>
    );
  }

  if (stock.lowStock) {
    return (
      <Badge className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Low Stock - Only {stock.stock} left
      </Badge>
    );
  }

  return (
    <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
      In Stock ({stock.stock} available)
    </Badge>
  );
}
