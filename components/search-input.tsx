"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useSearchPending } from "@/components/search-pending";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startTransition } = useSearchPending();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const currentQuery = searchParams.get("q") ?? "";

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");
      startTransition(() => {
        router.replace(`/search?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 3 || value.length === 0) {
      debounceRef.current = setTimeout(() => {
        updateSearch(value);
      }, 400);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      updateSearch(inputRef.current?.value ?? "");
    }
  }

  function handleSearchClick() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    updateSearch(inputRef.current?.value ?? "");
  }

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== currentQuery) {
      inputRef.current.value = currentQuery;
    }
  }, [currentQuery]);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products..."
          defaultValue={currentQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-9"
          aria-label="Search products"
        />
      </div>
      <Button onClick={handleSearchClick} aria-label="Search">
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </div>
  );
}
