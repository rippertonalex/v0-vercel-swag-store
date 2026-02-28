import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_PRODUCT = {
  id: "tshirt_001",
  name: "Black Crewneck T-Shirt",
  slug: "black-crewneck-t-shirt",
  description: "A plain black tee",
  price: 3000,
  currency: "USD",
  category: "t-shirts",
  images: ["https://example.com/img.png"],
  featured: true,
  tags: ["black"],
  createdAt: "2026-02-10T16:00:00Z",
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/api-server", () => ({
  getCachedProduct: vi.fn(),
}));

describe("GET /api/cart", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null cart when no cookie exists", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any);

    const { GET } = await import("@/app/api/cart/route");
    const response = await GET();
    const body = await response.json();

    expect(body.cart).toBeNull();
  });

  it("returns enriched cart when cookie has items", async () => {
    const cartItems = JSON.stringify([
      { productId: "tshirt_001", quantity: 2, addedAt: "2026-02-28T00:00:00Z" },
    ]);

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: cartItems }),
    } as any);

    const { getCachedProduct } = await import("@/lib/api-server");
    vi.mocked(getCachedProduct).mockResolvedValue(MOCK_PRODUCT as any);

    const { GET } = await import("@/app/api/cart/route");
    const response = await GET();
    const body = await response.json();

    expect(body.cart).not.toBeNull();
    expect(body.cart.items).toHaveLength(1);
    expect(body.cart.items[0].productId).toBe("tshirt_001");
    expect(body.cart.items[0].quantity).toBe(2);
    expect(body.cart.items[0].lineTotal).toBe(6000);
    expect(body.cart.totalItems).toBe(2);
    expect(body.cart.subtotal).toBe(6000);
  });

  it("returns null cart when cookie has invalid JSON", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "not-json" }),
    } as any);

    const { GET } = await import("@/app/api/cart/route");
    const response = await GET();
    const body = await response.json();

    expect(body.cart).toBeNull();
  });

  it("skips items whose product fails to load", async () => {
    const cartItems = JSON.stringify([
      { productId: "tshirt_001", quantity: 1, addedAt: "2026-02-28T00:00:00Z" },
      { productId: "invalid_product", quantity: 1, addedAt: "2026-02-28T00:00:00Z" },
    ]);

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: cartItems }),
    } as any);

    const { getCachedProduct } = await import("@/lib/api-server");
    vi.mocked(getCachedProduct)
      .mockResolvedValueOnce(MOCK_PRODUCT as any)
      .mockRejectedValueOnce(new Error("Not found"));

    const { GET } = await import("@/app/api/cart/route");
    const response = await GET();
    const body = await response.json();

    expect(body.cart.items).toHaveLength(1);
    expect(body.cart.items[0].productId).toBe("tshirt_001");
  });
});
