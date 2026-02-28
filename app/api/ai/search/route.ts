import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getCachedProducts } from "@/lib/api-server";
import { formatPrice } from "@/lib/api";

export const maxDuration = 15;

export async function POST(req: Request) {
  const { query }: { query: string } = await req.json();

  if (!query || query.trim().length < 2) {
    return Response.json({ productIds: [] });
  }

  const { data: products } = await getCachedProducts({ limit: 100 });

  const catalog = products
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${formatPrice(p.price, p.currency)} | ${p.category} | ${p.description} | ${p.tags.join(", ")}`,
    )
    .join("\n");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      productIds: z
        .array(z.string())
        .describe("Array of product IDs that match the query, best matches first"),
      reasoning: z
        .string()
        .describe("Brief explanation of why these products match"),
    }),
    prompt: `You are a product search engine for the Vercel Swag Store. Given a user's search query, return the product IDs that best match their intent. Consider semantic meaning, not just keyword matching.

For example:
- "something warm" → hoodies, beanies
- "gift for a developer" → variety of popular items
- "desk setup" → desk mats, mugs, tech accessories
- "something to wear" → t-shirts, hoodies, hats, socks

Return up to 6 best matches, ordered by relevance. If nothing matches, return an empty array.

Product catalog (ID | Name | Price | Category | Description | Tags):
${catalog}

User query: "${query}"`,
  });

  return Response.json(object);
}
