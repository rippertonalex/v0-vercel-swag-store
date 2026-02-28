"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

interface SearchPendingContextValue {
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

const SearchPendingContext = createContext<SearchPendingContextValue>({
  isPending: false,
  startTransition: (fn) => fn(),
});

export function useSearchPending() {
  return useContext(SearchPendingContext);
}

export function SearchPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  return (
    <SearchPendingContext.Provider value={{ isPending, startTransition }}>
      <div className={isPending ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
        {children}
      </div>
    </SearchPendingContext.Provider>
  );
}
