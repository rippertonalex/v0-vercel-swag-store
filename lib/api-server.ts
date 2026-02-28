"use cache";

import { unstable_cacheLife as cacheLife } from "next/cache";
import {
  getProducts as _getProducts,
  getFeaturedProducts as _getFeaturedProducts,
  getProduct as _getProduct,
  getCategories as _getCategories,
  getActivePromotion as _getActivePromotion,
  type Product,
  type Category,
  type Promotion,
  type PaginationMeta,
} from "@/lib/api";

export type { Product, Category, Promotion, PaginationMeta };

export async function getCachedProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<{ data: Product[]; meta: { pagination: PaginationMeta } }> {
  cacheLife("hours");
  return _getProducts(params);
}

export async function getCachedFeaturedProducts(): Promise<Product[]> {
  cacheLife("days");
  return _getFeaturedProducts();
}

export async function getCachedProduct(idOrSlug: string): Promise<Product> {
  cacheLife("hours");
  return _getProduct(idOrSlug);
}

export async function getCachedCategories(): Promise<Category[]> {
  cacheLife("days");
  return _getCategories();
}

export async function getCachedActivePromotion(): Promise<Promotion> {
  cacheLife("hours");
  return _getActivePromotion();
}
