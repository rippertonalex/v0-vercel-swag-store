// Caching layer — wraps raw API functions with "use cache" + cacheLife.
// Same inputs = instant cache hit. First call populates, subsequent calls are ~0ms.
import { cacheLife } from "next/cache";
import {
  getProducts,
  getFeaturedProducts,
  getProduct,
  getCategories,
  getActivePromotion,
} from "@/lib/api";

export async function getCachedProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}) {
  "use cache";
  cacheLife("hours");
  return getProducts(params);
}

export async function getCachedFeaturedProducts() {
  "use cache";
  cacheLife("days");
  return getFeaturedProducts();
}

export async function getCachedProduct(idOrSlug: string) {
  "use cache";
  cacheLife("hours");
  return getProduct(idOrSlug);
}

export async function getCachedCategories() {
  "use cache";
  cacheLife("days");
  return getCategories();
}

export async function getCachedActivePromotion() {
  "use cache";
  cacheLife("hours");
  return getActivePromotion();
}
