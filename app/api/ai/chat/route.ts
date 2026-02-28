import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { getCachedProducts } from "@/lib/api-server";
import { formatPrice } from "@/lib/api";

export const maxDuration = 30;

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
  const { messages }: { messages: UIMessage[] } = await req.json();

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
- When recommending products, always include the product name, price, and a link formatted as [Product Name](/products/SLUG)
- Prices are already formatted — use them as-is
- If someone asks for something not in the catalog, politely let them know and suggest alternatives
- Keep responses brief (2-4 sentences) unless the user asks for detail
- You can suggest multiple products when relevant
- Be enthusiastic about the products but not pushy

Here is the complete product catalog:

${catalog}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
