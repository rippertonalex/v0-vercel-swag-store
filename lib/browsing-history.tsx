"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ViewedProduct {
  slug: string;
  name: string;
  viewedAt: number;
  duration: number;
}

interface BrowsingHistoryContextValue {
  viewedProducts: ViewedProduct[];
  trackView: (slug: string, name: string) => void;
  endView: (slug: string) => void;
}

const STORAGE_KEY = "browsing-history";
const MAX_ITEMS = 20;

const BrowsingHistoryContext =
  createContext<BrowsingHistoryContextValue | null>(null);

export function useBrowsingHistory() {
  const ctx = useContext(BrowsingHistoryContext);
  if (!ctx)
    throw new Error(
      "useBrowsingHistory must be used within BrowsingHistoryProvider",
    );
  return ctx;
}

function readHistory(): ViewedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeHistory(items: ViewedProduct[]) {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_ITEMS)),
  );
}

export function BrowsingHistoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    setViewedProducts(readHistory());
  }, []);

  const trackView = useCallback((slug: string, name: string) => {
    setViewedProducts((prev) => {
      const existing = prev.find((p) => p.slug === slug);
      let updated: ViewedProduct[];
      if (existing) {
        updated = [
          { ...existing, viewedAt: Date.now(), duration: existing.duration },
          ...prev.filter((p) => p.slug !== slug),
        ];
      } else {
        updated = [
          { slug, name, viewedAt: Date.now(), duration: 0 },
          ...prev,
        ];
      }
      writeHistory(updated);
      return updated;
    });
  }, []);

  const endView = useCallback((slug: string) => {
    setViewedProducts((prev) => {
      const updated = prev.map((p) =>
        p.slug === slug
          ? { ...p, duration: p.duration + (Date.now() - p.viewedAt) }
          : p,
      );
      writeHistory(updated);
      return updated;
    });
  }, []);

  return (
    <BrowsingHistoryContext.Provider
      value={{ viewedProducts, trackView, endView }}
    >
      {children}
    </BrowsingHistoryContext.Provider>
  );
}
