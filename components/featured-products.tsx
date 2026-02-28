import { Suspense } from "react";
import { getCachedFeaturedProducts } from "@/lib/api-server";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

async function FeaturedProductsContent() {
  const products = await getCachedFeaturedProducts();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-border">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Featured Products
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Handpicked favorites from the Vercel collection.
          </p>
        </div>
      </div>
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProductsContent />
      </Suspense>
    </section>
  );
}
