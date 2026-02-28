import Link from "next/link";
import { formatPrice, type Product } from "@/lib/api";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
