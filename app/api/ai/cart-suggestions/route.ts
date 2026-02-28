import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getCachedProducts } from "@/lib/api-server";
import { formatPrice } from "@/lib/api";

export const maxDuration = 15;

export async function POST(req: Request) {
  const {
    cartItems,
    viewedProducts,
  }: {
    cartItems: { name: string; category: string; quantity: number }[];
    viewedProducts: { name: string; slug: string; durationSeconds: number }[];
  } = await req.json();

  if (cartItems.length === 0) {
    return Response.json({ message: null, suggestions: [], reminder: null });
  }

  const { data: allProducts } = await getCachedProducts({ limit: 100 });

  const cartNames = new Set(cartItems.map((i) => i.name));
  const available = allProducts.filter((p) => !cartNames.has(p.name));

  const catalog = available
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${formatPrice(p.price, p.currency)} | ${p.category} | ${p.tags.join(", ")}`,
    )
    .join("\n");

  const cartSummary = cartItems
    .map((i) => `${i.quantity}x ${i.name} (${i.category})`)
    .join(", ");

  const browsingContext =
    viewedProducts.length > 0
      ? `\n\nProducts the user recently browsed (with time spent):\n${viewedProducts
          .slice(0, 10)
          .map((p) => `- ${p.name} (viewed for ${p.durationSeconds}s)`)
          .join("\n")}`
      : "";

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      message: z
        .string()
        .describe(
          "A short, witty, fun message (1-2 sentences) about their cart. Be playful and developer-themed.",
        ),
      suggestions: z
        .array(
          z.object({
            productId: z.string(),
            reason: z
              .string()
              .describe("Brief witty reason why this pairs well, under 10 words"),
          }),
        )
        .describe("2-3 product suggestions that complement their cart"),
      reminder: z
        .object({
          slug: z.string(),
          message: z
            .string()
            .describe(
              "Short nudge about the product they browsed, under 15 words",
            ),
        })
        .nullable()
        .describe(
          "If the user spent significant time viewing a product not in their cart, nudge them about it. Null if no relevant browsing history.",
        ),
    }),
    prompt: `You're a witty shopping assistant for the Vercel Swag Store (developer merchandise). Generate a fun cart message, product suggestions, and optionally a browsing reminder.

Cart contents: ${cartSummary}
${browsingContext}

Available products to suggest (not already in cart):
${catalog}

Rules:
- The message should be playful, short, and developer-themed (git puns, deploy jokes, etc.)
- Suggest 2-3 products that genuinely complement what's in the cart
- If browsing history shows they spent 5+ seconds on a product not in their cart, create a reminder nudge
- Keep everything concise and fun`,
  });

  const enrichedSuggestions = object.suggestions
    .map((s) => {
      const product = allProducts.find((p) => p.id === s.productId);
      if (!product) return null;
      return {
        ...s,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          image: product.images[0] ?? null,
        },
      };
    })
    .filter((s) => s !== null);

  return Response.json({
    ...object,
    suggestions: enrichedSuggestions,
  });
}
