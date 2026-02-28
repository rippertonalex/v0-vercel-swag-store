import { Suspense } from "react";
import { getCachedActivePromotion } from "@/lib/api-server";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "lucide-react";

async function PromoBannerContent() {
  const promo = await getCachedActivePromotion();

  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-center sm:px-6 lg:px-8">
        <Tag className="hidden size-4 shrink-0 sm:block" />
        <p className="text-sm font-medium">
          <span className="font-semibold">{promo.title}</span>
          <span className="mx-2 hidden sm:inline">{"--"}</span>
          <span className="hidden sm:inline">{promo.description}</span>
          {promo.code && (
            <span className="ml-2 inline-flex items-center rounded-sm bg-background/15 px-2 py-0.5 font-mono text-xs">
              {promo.code}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function PromoBannerSkeleton() {
  return (
    <div className="bg-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-64 bg-background/10" />
      </div>
    </div>
  );
}

export function PromoBanner() {
  return (
    <Suspense fallback={<PromoBannerSkeleton />}>
      <PromoBannerContent />
    </Suspense>
  );
}
