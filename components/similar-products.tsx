import { Suspense } from "react";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getCachedProducts } from "@/lib/api-server";
import { formatPrice, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cacheLife } from "next/cache";

async function getSimilarProductIds(product: Product): Promise<string[]> {
  "use cache";
  cacheLife("days");

  const { data: allProducts } = await getCachedProducts({ limit: 100 });

  const catalog = allProducts
    .filter((p) => p.id !== product.id)
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${formatPrice(p.price, p.currency)} | ${p.category} | ${p.description} | ${p.tags.join(", ")}`,
    )
    .join("\n");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      productIds: z
        .array(z.string())
        .describe("IDs of the 4 most similar products"),
    }),
    prompt: `Given this product, find the 4 most similar products from the catalog based on category, use case, style, and description.

Current product:
- Name: ${product.name}
- Category: ${product.category}
- Description: ${product.description}
- Tags: ${product.tags.join(", ")}

Catalog (ID | Name | Price | Category | Description | Tags):
${catalog}

Return exactly 4 product IDs, ordered by similarity.`,
  });

  return object.productIds;
}

async function SimilarProductsContent({ product }: { product: Product }) {
  const [similarIds, { data: allProducts }] = await Promise.all([
    getSimilarProductIds(product),
    getCachedProducts({ limit: 100 }),
  ]);

  const similar = similarIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (similar.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {similar.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function SimilarProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border"
        >
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

export function SimilarProducts({ product }: { product: Product }) {
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        You might also like
      </h2>
      <Suspense fallback={<SimilarProductsSkeleton />}>
        <SimilarProductsContent product={product} />
      </Suspense>
    </section>
  );
}
