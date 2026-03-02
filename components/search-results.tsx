import { cacheLife } from "next/cache";
import { getProducts } from "@/lib/api";
import type { Product, PaginationMeta } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { PackageOpen } from "lucide-react";

export async function SearchResults({
  query,
  category,
}: {
  query?: string;
  category?: string;
}) {
  "use cache";
  cacheLife("hours");

  let products: Product[] = [];
  let pagination: PaginationMeta | null = null;

  try {
    const res = await getProducts({
      ...(query && { search: query }),
      ...(category && { category }),
      limit: query ? 5 : 20,
    });
    products = res.data;
    pagination = res.meta.pagination;
  } catch {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Something went wrong while searching. Please try again.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <PackageOpen className="size-10 text-muted-foreground/50" />
        <div>
          <p className="font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? `No results for "${query}". Try adjusting your search or filters.`
              : "No products match the selected category."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {pagination && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {products.length} of {pagination.total} product
          {pagination.total !== 1 ? "s" : ""}
          {query ? ` for "${query}"` : ""}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
