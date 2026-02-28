"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/api";
import { useSearchPending } from "@/components/search-pending";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startTransition } = useSearchPending();
  const currentCategory = searchParams.get("category") ?? "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`/search?${params.toString()}`);
    });
  }

  return (
    <Select value={currentCategory} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-48" aria-label="Filter by category">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.slug} value={cat.slug}>
            {cat.name} ({cat.productCount})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
