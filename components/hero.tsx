import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Ship it. Wear it. Love it.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Premium developer apparel, accessories, and gear. Built with the same
          attention to detail you bring to your code.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button asChild size="lg">
            <Link href="/search">
              Browse All Products
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {/* Decorative grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]">
          <div
            className="size-full"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>
      </div>
    </section>
  );
}
