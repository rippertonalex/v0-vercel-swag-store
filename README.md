# Vercel Swag Store

A high-performance storefront built with Next.js 16, demonstrating modern React Server Component patterns, advanced caching strategies, and AI-powered shopping features using the Vercel AI SDK.

## Tech Stack

- **Framework:** Next.js 16 with Turbopack and Cache Components
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with Geist design system
- **AI:** Vercel AI SDK + OpenAI (gpt-4o-mini)
- **Testing:** Vitest + React Testing Library + Playwright
- **Analytics:** Vercel Analytics + Vercel Speed Insights
- **Deployment:** Vercel

## Features

### Core Storefront

- **Homepage** with hero section, promotional banner (from API), and featured products grid
- **Product Detail Pages** with large images, real-time stock indicators, quantity selectors, and add-to-cart
- **Search Page** with keyword search, category filtering, URL-persisted state, and debounced auto-search
- **Cart** with add/update/remove, session persistence via cookies, and optimistic UI updates with rollback

### AI-Powered Features (Vercel AI SDK)

- **Agentic Shopping Assistant** — Conversational AI chat on the homepage with streaming responses, inline product cards, and tool calling for real-time stock checks and add-to-cart actions
- **Semantic Search** — AI-powered search that understands natural language queries ("something warm for winter" returns hoodies and beanies)
- **Similar Products** — AI-generated "You might also like" recommendations on every product page, computed at build time and cached
- **Smart Cart Suggestions** — Witty, developer-themed cart messages with product recommendations and browsing history-aware nudges

### Performance & Caching

- **`"use cache"` with `cacheLife`** for all data fetching (products, categories, promotions)
- **`generateStaticParams`** pre-renders all 28 product pages at build time
- **Instrumentation pre-warming** — on server boot, pre-warms the cache for all products, categories, promotions, and all 13 category filter combinations
- **Dual-key product cache** — products cached by both slug (for pages) and ID (for cart lookups)
- **Edge caching** on stock endpoint (`s-maxage=10, stale-while-revalidate=20`)
- **`useTransition`** for smooth search/filter transitions without skeleton flashes
- **Next.js Image optimization** with responsive `sizes` and `priority` for LCP images
- **Suspense boundaries** on all async server components for streaming SSR

## Architecture Decisions

### Cart Implementation

The external API's Redis backing store is down (confirmed via the `/health` endpoint reporting `"redis": "error"`). Rather than being blocked, I implemented a cookie-based cart using Server Actions, enriched with product data from the working product API. This demonstrates resilience and satisfies the "session-based, persists within browser session" requirement without depending on external infrastructure.

### AI Architecture

All AI features (chat assistant, semantic search, similar products, cart suggestions) work by injecting the complete product catalog — names, descriptions, prices, categories, and tags — directly into the model's context window. With 28 products totaling ~2K tokens, this fits easily within gpt-4o-mini's 128K context and lets the model reason over the entire catalog at once, producing better recommendations than retrieval-based approaches would at this scale.

This is not RAG (Retrieval-Augmented Generation) — there's no vector database, no embedding pipeline, and no similarity search. Every AI call sees every product. This is a deliberate architectural choice: at 28 items, full context injection is faster, simpler, and more accurate than chunked retrieval.

At scale (10,000+ products), this approach wouldn't work — the catalog would exceed context limits. At that point I'd introduce OpenAI embeddings with a vector database (Pinecone or Postgres pgvector), chunk products by category, and use hybrid retrieval (semantic similarity + keyword filtering) to select the most relevant subset before passing it to the model.

### Agentic Tool Calling

The shopping assistant uses two tools that demonstrate different execution patterns:

- **`checkStock`** — A server-executed read tool. Calls the real-time stock API directly in the route handler's `execute` function. The model uses this when a user asks about availability.
- **`addToCart`** — A client-executed write tool. The server streams the tool call to the client, where `onToolCall` handles it via a Server Action (cookie write) and syncs the SWR cart state. This must run client-side because `Set-Cookie` headers cannot be added after a streaming response has started flushing.

Stock validation uses defense in depth: the system prompt instructs the model to always call `checkStock` before `addToCart`, and the client-side handler enforces it as a safety net — rejecting out-of-stock items or quantities exceeding availability regardless of what the model decides.

`stopWhen: stepCountIs(3)` allows multi-step tool chaining (e.g., check stock → add to cart → generate response) in a single turn.

### Browsing History Tracking

Session-based (`sessionStorage`) tracking of product views with time-spent metrics. Fed into the cart suggestions AI to generate contextual nudges ("Still thinking about that desk mat you were looking at?"). Persists across navigation and page refreshes within the browser session.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
git clone <repo-url>
cd v0-vercel-swag-store
pnpm install
```

Create a `.env.local` file (see `.env.example`):

```
API_BASE_URL=https://vercel-swag-store-api.vercel.app/api
VERCEL_PROTECTION_BYPASS_TOKEN=your-bypass-token
OPENAI_API_KEY=your-openai-api-key
```

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Testing

```bash
# Unit + integration tests (Vitest)
pnpm test

# E2E browser tests (Playwright, requires dev server running)
pnpm test:e2e
```

## Project Structure

```
app/
  page.tsx                       # Homepage (hero, promo, AI assistant, featured products)
  search/page.tsx                # Search (keyword + AI semantic search)
  products/[slug]/page.tsx       # Product detail (static generation, similar products)
  api/
    cart/route.ts                # Cart API (cookie-based)
    products/route.ts            # Products API (cached, for client-side use)
    stock/[slug]/route.ts        # Stock API (edge-cached, real-time)
    ai/
      chat/route.ts              # AI shopping assistant (streaming + tool calling)
      search/route.ts            # AI semantic search (structured output)
      cart-suggestions/route.ts  # AI cart suggestions (structured output)

components/
  ai-assistant.tsx               # Homepage chat with inline product embeds
  ai-search-results.tsx          # Semantic search results
  similar-products.tsx           # AI-generated product recommendations
  cart-suggestions.tsx           # Smart cart suggestions with browsing history
  cart-sheet.tsx                 # Slide-out cart panel
  add-to-cart-form.tsx           # Quantity selector + add to cart
  stock-indicator.tsx            # Real-time stock badge (SWR polling)

lib/
  api.ts                         # External API client
  api-server.ts                  # Cached API functions ("use cache")
  cart-actions.ts                # Server Actions for cart mutations
  cart-utils.ts                  # Shared cart building logic
  cart-context.tsx               # Client-side cart state (SWR + optimistic updates)
  browsing-history.tsx           # Session-based product view tracking

instrumentation.ts               # Server boot cache pre-warming
```
