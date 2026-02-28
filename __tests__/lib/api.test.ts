import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

vi.stubEnv("API_BASE_URL", "https://vercel-swag-store-api.vercel.app/api");
vi.stubEnv("VERCEL_PROTECTION_BYPASS_TOKEN", "test-bypass-token");

let formatPrice: typeof import("@/lib/api").formatPrice;
let getProducts: typeof import("@/lib/api").getProducts;
let getProduct: typeof import("@/lib/api").getProduct;
let getProductStock: typeof import("@/lib/api").getProductStock;

beforeAll(async () => {
  const api = await import("@/lib/api");
  formatPrice = api.formatPrice;
  getProducts = api.getProducts;
  getProduct = api.getProduct;
  getProductStock = api.getProductStock;
});

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
  tags: ["black", "tee"],
  createdAt: "2026-02-10T16:00:00Z",
};

describe("formatPrice", () => {
  it("formats cents to USD currency string", () => {
    expect(formatPrice(3000)).toBe("$30.00");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats small amounts", () => {
    expect(formatPrice(99)).toBe("$0.99");
  });

  it("formats large amounts", () => {
    expect(formatPrice(150000)).toBe("$1,500.00");
  });

  it("respects currency parameter", () => {
    const result = formatPrice(1000, "EUR");
    expect(result).toContain("10");
  });
});

describe("getProducts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct URL with no params", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [MOCK_PRODUCT],
          meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await getProducts();

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/products");
  });

  it("appends query params for category and search", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [],
          meta: { pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await getProducts({ category: "hats", search: "black", limit: 5 });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("category=hats");
    expect(url).toContain("search=black");
    expect(url).toContain("limit=5");
  });

  it("includes the bypass header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [],
          meta: { pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await getProducts();

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>)["x-vercel-protection-bypass"]).toBeDefined();
  });

  it("throws on non-ok response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: { message: "Server error" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts()).rejects.toThrow("Server error");
  });
});

describe("getProduct", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches a product by slug", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: MOCK_PRODUCT }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const product = await getProduct("black-crewneck-t-shirt");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/products/black-crewneck-t-shirt");
    expect(product.name).toBe("Black Crewneck T-Shirt");
  });
});

describe("getProductStock", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches stock for a product", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { productId: "tshirt_001", stock: 12, inStock: true, lowStock: false },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const stock = await getProductStock("tshirt_001");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/products/tshirt_001/stock");
    expect(stock.stock).toBe(12);
    expect(stock.inStock).toBe(true);
  });
});
