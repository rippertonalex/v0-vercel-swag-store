const API_BASE = "https://vercel-swag-store-api.vercel.app/api";
const BYPASS_TOKEN = "OykROcuULI6YJwAwk3VnWv4gMMbpAq6q";

// --- Types ---

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  featured: boolean;
  tags: string[];
  createdAt: string;
}

export interface StockInfo {
  productId: string;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
}

export interface Category {
  slug: string;
  name: string;
  productCount: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  addedAt: string;
  product: Product;
  lineTotal: number;
}

export interface Cart {
  token: string;
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { pagination: PaginationMeta };
}

// --- Helpers ---

function headers(cartToken?: string): HeadersInit {
  const h: HeadersInit = {
    "x-vercel-protection-bypass": BYPASS_TOKEN,
  };
  if (cartToken) {
    h["x-cart-token"] = cartToken;
  }
  return h;
}

async function apiFetch<T>(
  path: string,
  opts?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      ...headers(),
      ...(opts?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      err?.error?.message || `API error: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

// --- Product APIs ---

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<{ data: Product[]; meta: { pagination: PaginationMeta } }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.featured !== undefined)
    searchParams.set("featured", String(params.featured));

  const qs = searchParams.toString();
  const res = await apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  return { data: res.data, meta: res.meta! };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const res = await getProducts({ featured: true, limit: 6 });
  return res.data;
}

export async function getProduct(idOrSlug: string): Promise<Product> {
  const res = await apiFetch<Product>(`/products/${idOrSlug}`);
  return res.data;
}

export async function getProductStock(idOrSlug: string): Promise<StockInfo> {
  const res = await apiFetch<StockInfo>(`/products/${idOrSlug}/stock`);
  return res.data;
}

// --- Category APIs ---

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<Category[]>("/categories");
  return res.data;
}

// --- Promotion APIs ---

export async function getActivePromotion(): Promise<Promotion> {
  const res = await apiFetch<Promotion>("/promotions");
  return res.data;
}

// --- Cart APIs ---

export async function createCart(): Promise<{ cart: Cart; token: string }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));

    const res = await fetch(`${API_BASE}/cart/create`, {
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      lastError = new Error(`Cart create failed with status ${res.status}`);
      continue;
    }

    const body: ApiResponse<Cart> = await res.json();
    const token = res.headers.get("x-cart-token") || body.data?.token || "";
    if (token) {
      return { cart: body.data, token };
    }
    lastError = new Error("Cart created but no token in response");
  }

  throw lastError ?? new Error("Failed to create cart after retries");
}

export async function getCart(cartToken: string): Promise<Cart> {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: {
      ...headers(),
      "x-cart-token": cartToken,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch cart");
  const body: ApiResponse<Cart> = await res.json();
  return body.data;
}

export async function addToCart(
  cartToken: string,
  productId: string,
  quantity: number = 1
): Promise<Cart> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: {
      ...headers(),
      "x-cart-token": cartToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to add to cart");
  }
  const body: ApiResponse<Cart> = await res.json();
  return body.data;
}

export async function updateCartItem(
  cartToken: string,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const res = await fetch(`${API_BASE}/cart/${itemId}`, {
    method: "PATCH",
    headers: {
      ...headers(),
      "x-cart-token": cartToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  const body: ApiResponse<Cart> = await res.json();
  return body.data;
}

export async function removeCartItem(
  cartToken: string,
  itemId: string
): Promise<Cart> {
  const res = await fetch(`${API_BASE}/cart/${itemId}`, {
    method: "DELETE",
    headers: {
      ...headers(),
      "x-cart-token": cartToken,
    },
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
  const body: ApiResponse<Cart> = await res.json();
  return body.data;
}

// --- Formatting ---

export function formatPrice(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
