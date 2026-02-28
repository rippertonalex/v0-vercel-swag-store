"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductStock, type StockInfo } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function StockIndicator({ productSlug }: { productSlug: string }) {
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      const data = await getProductStock(productSlug);
      setStock(data);
    } catch {
      setStock(null);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchStock();

    // Refresh stock every 30 seconds
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, [fetchStock]);

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
