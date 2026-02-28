import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product-card";

const MOCK_PRODUCT = {
  id: "tshirt_001",
  name: "Black Crewneck T-Shirt",
  slug: "black-crewneck-t-shirt",
  description: "A plain black tee",
  price: 3000,
  currency: "USD",
  category: "t-shirts",
  images: ["https://i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com/storefront/black-crewneck-t-shirt.png"],
  featured: true,
  tags: ["black", "tee"],
  createdAt: "2026-02-10T16:00:00Z",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={MOCK_PRODUCT} />);
    expect(screen.getByText("Black Crewneck T-Shirt")).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    render(<ProductCard product={MOCK_PRODUCT} />);
    expect(screen.getByText("$30.00")).toBeInTheDocument();
  });

  it("renders product image with alt text", () => {
    render(<ProductCard product={MOCK_PRODUCT} />);
    const img = screen.getByAltText("Black Crewneck T-Shirt");
    expect(img).toBeInTheDocument();
  });

  it("links to the correct product page", () => {
    render(<ProductCard product={MOCK_PRODUCT} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/black-crewneck-t-shirt");
  });

  it("renders without images gracefully", () => {
    const productNoImage = { ...MOCK_PRODUCT, images: [] };
    render(<ProductCard product={productNoImage} />);
    expect(screen.getByText("Black Crewneck T-Shirt")).toBeInTheDocument();
  });
});
