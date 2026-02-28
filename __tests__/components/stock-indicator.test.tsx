import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockIndicator } from "@/components/stock-indicator";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

describe("StockIndicator", () => {
  it("shows loading skeleton when data is loading", async () => {
    const useSWR = (await import("swr")).default;
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as any);

    const { container } = render(<StockIndicator productSlug="test" />);
    expect(container.querySelector("[data-slot='skeleton'], .animate-pulse")).toBeTruthy();
  });

  it("shows 'In Stock' badge when product is in stock", async () => {
    const useSWR = (await import("swr")).default;
    vi.mocked(useSWR).mockReturnValue({
      data: { productId: "test", stock: 10, inStock: true, lowStock: false },
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as any);

    render(<StockIndicator productSlug="test" />);
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it("shows 'Low Stock' badge when stock is low", async () => {
    const useSWR = (await import("swr")).default;
    vi.mocked(useSWR).mockReturnValue({
      data: { productId: "test", stock: 3, inStock: true, lowStock: true },
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as any);

    render(<StockIndicator productSlug="test" />);
    expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  });

  it("shows 'Out of Stock' badge when not in stock", async () => {
    const useSWR = (await import("swr")).default;
    vi.mocked(useSWR).mockReturnValue({
      data: { productId: "test", stock: 0, inStock: false, lowStock: false },
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as any);

    render(<StockIndicator productSlug="test" />);
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  it("shows 'Unavailable' when stock data is null", async () => {
    const useSWR = (await import("swr")).default;
    vi.mocked(useSWR).mockReturnValue({
      data: null,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as any);

    render(<StockIndicator productSlug="test" />);
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});
