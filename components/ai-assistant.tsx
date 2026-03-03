"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  Package,
  ShoppingCart,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import useSWR from "swr";

const transport = new DefaultChatTransport({ api: "/api/ai/chat" });

const productsFetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((d) => d.data as Product[]);

function ProductEmbed({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="my-1 flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:border-foreground/20"
    >
      {product.images[0] && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-medium text-foreground">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function MessageContent({
  text,
  productMap,
}: {
  text: string;
  productMap: Map<string, Product>;
}) {
  const parts = text.split(/(\{\{product:[^}]+\}\})/g);

  const textParts: string[] = [];
  const productEmbeds: Product[] = [];

  for (const part of parts) {
    const match = part.match(/^\{\{product:([^}]+)\}\}$/);
    if (match) {
      const product = productMap.get(match[1]);
      if (product) productEmbeds.push(product);
    } else if (part.trim()) {
      textParts.push(part);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {textParts.length > 0 && (
        <span className="whitespace-pre-wrap">{textParts.join("")}</span>
      )}
      {productEmbeds.length > 0 && (
        <div className="flex flex-col gap-1">
          {productEmbeds.map((product) => (
            <ProductEmbed key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AiAssistant() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const { data: allProducts } = useSWR("/api/products", productsFetcher);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    allProducts?.forEach((p) => {
      map.set(p.slug, p);
      map.set(p.id, p);
    });
    return map;
  }, [allProducts]);

  const { messages, sendMessage, status, addToolOutput } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "addToCart") {
        const { productSlug, quantity } = toolCall.input as {
          productSlug: string;
          quantity: number;
        };
        const product = productMap.get(productSlug);
        if (!product) {
          addToolOutput({
            tool: "addToCart",
            toolCallId: toolCall.toolCallId,
            output: { success: false, error: "Product not found" },
          });
          return;
        }
        try {
          const stockRes = await fetch(`/api/stock/${product.slug}`);
          const { stock: stockInfo } = await stockRes.json();
          if (!stockInfo?.inStock) {
            addToolOutput({
              tool: "addToCart",
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: `${product.name} is currently out of stock`,
              },
            });
            return;
          }
          if (stockInfo.stock < (quantity || 1)) {
            addToolOutput({
              tool: "addToCart",
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: `Only ${stockInfo.stock} available, but ${quantity} requested`,
              },
            });
            return;
          }
          await addToCart(product.id, quantity || 1);
          addToolOutput({
            tool: "addToCart",
            toolCallId: toolCall.toolCallId,
            output: {
              success: true,
              productName: product.name,
              quantity: quantity || 1,
            },
          });
        } catch {
          addToolOutput({
            tool: "addToCart",
            toolCallId: toolCall.toolCallId,
            output: { success: false, error: "Failed to add to cart" },
          });
        }
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";
  const hasMessages = messages.length > 0;

  const suggestions = [
    "What's good for a developer gift?",
    "Is the black crewneck t-shirt in stock?",
    "Add the black desk mat to my cart",
    "What hats do you have?",
  ];

  function handleSuggestionClick(text: string) {
    if (isLoading) return;
    sendMessage({ text });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {hasMessages && (
          <>
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <Sparkles className="size-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Agentic AI Shopping Assistant
              </span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                AI
              </span>
            </div>

            <div
              ref={scrollRef}
              className="flex max-h-96 flex-col gap-3 overflow-y-auto px-5 py-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <MessageContent
                            key={`${message.id}-${i}`}
                            text={part.text}
                            productMap={productMap}
                          />
                        );
                      }
                      if (part.type === "tool-checkStock") {
                        if (part.state !== "output-available") {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                            >
                              <Loader2 className="size-3 animate-spin" />
                              Checking stock...
                            </div>
                          );
                        }
                        const result = part.output as {
                          stock: number;
                          inStock: boolean;
                          lowStock: boolean;
                          error?: boolean;
                        };
                        if (result.error) {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400"
                            >
                              <AlertCircle className="size-3" />
                              Unable to check stock
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                              result.inStock
                                ? result.lowStock
                                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                  : "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            <Package className="size-3" />
                            {result.inStock
                              ? result.lowStock
                                ? `Low stock — ${result.stock} left`
                                : `In stock — ${result.stock} available`
                              : "Out of stock"}
                          </div>
                        );
                      }
                      if (part.type === "tool-addToCart") {
                        if (part.state !== "output-available") {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                            >
                              <Loader2 className="size-3 animate-spin" />
                              Adding to cart...
                            </div>
                          );
                        }
                        const result = part.output as {
                          success: boolean;
                          productName?: string;
                          quantity?: number;
                          error?: string;
                        };
                        if (!result.success) {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400"
                            >
                              <AlertCircle className="size-3" />
                              {result.error || "Failed to add to cart"}
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:text-green-400"
                          >
                            <ShoppingCart className="size-3" />
                            <Check className="size-3" />
                            Added{" "}
                            {result.quantity && result.quantity > 1
                              ? `${result.quantity}x `
                              : ""}
                            to cart
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}

              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-secondary px-3 py-2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
            </div>
          </>
        )}

        <div className={hasMessages ? "border-t border-border" : ""}>
          {!hasMessages && (
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {suggestions.map((text) => (
                <button
                  key={text}
                  onClick={() => handleSuggestionClick(text)}
                  disabled={isLoading}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-5 py-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you today? Ask about products, get recommendations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              type="submit"
              size="icon"
              className="size-8 shrink-0"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
