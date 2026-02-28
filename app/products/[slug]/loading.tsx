import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="mb-3 h-6 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-2 h-8 w-24" />
          </div>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
