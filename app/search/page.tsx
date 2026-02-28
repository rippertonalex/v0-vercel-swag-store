import { Suspense } from "react";
import type { Metadata } from "next";
import { getCachedCategories, getCachedProducts } from "@/lib/api-server";
import { SearchInput } from "@/components/search-input";
import { CategoryFilter } from "@/components/category-filter";
import { SearchResults } from "@/components/search-results";
import { AiSearchResults } from "@/components/ai-search-results";
import { SearchPendingProvider } from "@/components/search-pending";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Search",
  description: "Search and browse the Vercel Swag Store catalog.",
  openGraph: {
    title: "Search | Vercel Swag Store",
    description: "Search and browse the Vercel Swag Store catalog.",
  },
};

function SearchResultsSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
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
    </div>
  );
}

async function CategoriesFilter() {
  const categories = await getCachedCategories();
  return <CategoryFilter categories={categories} />;
}

async function AiSearchSection() {
  const { data: allProducts } = await getCachedProducts({ limit: 100 });
  return <AiSearchResults products={allProducts} />;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Shop All Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our full catalog of developer gear.
        </p>
      </div>

      <SearchPendingProvider>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchInput />
          </div>
          <Suspense fallback={<Skeleton className="h-10 w-full sm:w-48" />}>
            <CategoriesFilter />
          </Suspense>
        </div>

        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={q} category={category} />
        </Suspense>

        <Suspense>
          <AiSearchSection />
        </Suspense>
      </SearchPendingProvider>
    </div>
  );
}
