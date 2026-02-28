"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cart, isPending, updateQuantity, removeFromCart } = useCart();
  const items = cart?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Your cart is empty."
              : `${cart?.totalItems ?? 0} item${(cart?.totalItems ?? 0) !== 1 ? "s" : ""} in your cart.`}
          </SheetDescription>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="flex flex-col gap-4 pb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
                          onClick={() => onOpenChange(false)}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            disabled={isPending}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            disabled={isPending}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {formatPrice(item.lineTotal)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() => removeFromCart(item.productId)}
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <SheetFooter className="flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Subtotal</span>
                <span className="text-base font-semibold text-foreground">
                  {formatPrice(cart?.subtotal ?? 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <p className="text-sm text-muted-foreground">
              Add some items to get started.
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              asChild
            >
              <Link href="/search">Browse Products</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
