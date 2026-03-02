import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getCachedProducts } from "@/lib/api-server";
import { formatPrice, getProductStock } from "@/lib/api";

export const maxDuration = 30;

// Injects full catalog (~2K tokens) into context — not RAG.
// 28 products fits easily; vector DB would be over-engineering at this scale.
async function buildProductCatalog(): Promise<string> {
  const { data: products } = await getCachedProducts({ limit: 100 });

  return products
    .map(
      (p) =>
        `- **${p.name}** (${formatPrice(p.price, p.currency)}) [slug: ${p.slug}, id: ${p.id}]
  Category: ${p.category}
  Description: ${p.description}
  Tags: ${p.tags.join(", ")}`,
    )
    .join("\n\n");
}

export async function POST(req: Request) {
  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const catalog = await buildProductCatalog();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a friendly and knowledgeable shopping assistant for the Vercel Swag Store — an official merchandise store for developers who love Vercel and Next.js.

Your role:
- Help users find products that match what they're looking for
- Answer questions about specific products (materials, pricing, etc.)
- Make personalized recommendations based on their preferences
- Be conversational, concise, and helpful

Guidelines:
- When recommending products, embed them using this exact format on its own line: {{product:SLUG}} (e.g. {{product:black-crewneck-t-shirt}}). Product cards render automatically with images and prices, so NEVER mention the product name, price, or description in your text — the card handles that.
- Write your response as natural conversational text, then place the product embeds after. Do NOT reference products by name in your text — just describe what you're recommending and why, then let the cards speak for themselves.
- Bad example: "The **Minimal Black Backpack** is great! {{product:minimal-black-backpack}}" — this repeats the name.
- Good example: "Here are a couple of solid options for carrying your laptop — one's a backpack, one's a tote:\n\n{{product:minimal-black-backpack}}\n{{product:black-canvas-tote-bag}}"
- If someone asks for something not in the catalog, politely let them know and suggest alternatives
- Keep text brief (1-2 sentences), then show the products
- Be enthusiastic but not pushy
- Always use {{product:SLUG}} format, never markdown links or bold product names

You also have access to tools:
- checkStock: Check real-time stock availability. Use this when the user asks if something is in stock, how many are left, or about availability. Stock levels are dynamic and change frequently, so always check rather than guessing.
- addToCart: Add a product to the user's cart. Use this when the user explicitly asks to add something. Always confirm what you're adding and the quantity. Default to quantity 1 unless the user specifies otherwise. IMPORTANT: Always call checkStock before addToCart to verify the item is available. If it's out of stock, let the user know instead of adding it.

Here is the complete product catalog:

${catalog}`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools: {
      checkStock: tool({
        description:
          "Check real-time stock availability for a product. Use when the user asks about stock, availability, or how many are left.",
        inputSchema: z.object({
          productSlug: z
            .string()
            .describe("The product slug to check stock for"),
        }),
        execute: async ({ productSlug }) => {
          try {
            return await getProductStock(productSlug);
          } catch {
            return { stock: 0, inStock: false, lowStock: false, error: true };
          }
        },
      }),
      addToCart: tool({
        description:
          "Add a product to the user's shopping cart. Use when the user explicitly asks to add an item.",
        inputSchema: z.object({
          productSlug: z.string().describe("The product slug to add"),
          quantity: z
            .number()
            .default(1)
            .describe("Quantity to add, defaults to 1"),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
