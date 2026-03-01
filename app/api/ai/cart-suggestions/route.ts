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
    return Response.json({ message: null, suggestions: [] });
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

  const browsedNotInCart = viewedProducts
    .filter((v) => v.durationSeconds >= 5)
    .slice(0, 3);

  const browsingContext =
    browsedNotInCart.length > 0
      ? `\n\nProducts the user browsed but didn't add to cart (with time spent):\n${browsedNotInCart
          .map((p) => `- ${p.name} [slug: ${p.slug}] (viewed for ${p.durationSeconds}s)`)
          .join("\n")}`
      : "";

  const suggestionSchema = z.object({
    message: z
      .string()
      .describe(
        "ONE sentence max. Witty, casual, developer-themed. If user browsed a product, nudge about it naturally. Example: 'I saw you checking out the tumbler — ready to ship it?' Do NOT describe or sell the other suggestions. No exclamation marks.",
      ),
    suggestions: z
      .array(
        z.object({
          productId: z.string(),
          reason: z
            .string()
            .describe("Brief witty reason, under 10 words"),
        }),
      )
      .describe(
        "2-3 product suggestions. If the user browsed a product without buying it, that product MUST be first in this list. Then add 1-2 complementary products.",
      ),
  });

  const { object } = (await generateObject({
    model: openai("gpt-4o-mini"),
    schema: suggestionSchema as any,
    prompt: `You're a witty shopping assistant for the Vercel Swag Store (developer merchandise).

Cart contents: ${cartSummary}
${browsingContext}

Available products to suggest (not already in cart):
${catalog}

Rules:
- Message must be ONE sentence, max 15 words. Dry wit, not salesy
- If user browsed a product, nudge about it and make it the FIRST suggestion
- Then add 1-2 complementary products
- Do NOT describe or sell the suggestions in the message — the cards do that
- You CAN mention the browsed product by name since you're nudging
- No exclamation marks. Think Vercel copywriting tone: minimal, clever, understated`,
  })) as { object: z.infer<typeof suggestionSchema> };

  const enrichedSuggestions = object.suggestions
    .map((s: { productId: string; reason: string }) => {
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
    .filter((s: unknown) => s !== null);

  return Response.json({
    message: object.message,
    suggestions: enrichedSuggestions,
  });
}
