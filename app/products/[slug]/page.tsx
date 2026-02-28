import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCachedProduct } from "@/lib/api-server";
import { formatPrice } from "@/lib/api";
import { StockIndicator } from "@/components/stock-indicator";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getCachedProduct(slug);
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: `${product.name} | Vercel Swag Store`,
        description: product.description,
        images: product.images[0] ? [product.images[0]] : [],
      },
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getCachedProduct(slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="eager"
              decoding="async"
              className="size-full object-cover"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <Badge variant="secondary" className="mb-3 capitalize">
              {product.category}
            </Badge>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          <StockIndicator productSlug={product.slug} />

          <Separator />

          <p className="text-pretty leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator />

          <AddToCartForm productId={product.id} productSlug={product.slug} />

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
