import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { PromoBanner } from "@/components/promo-banner";
import { FeaturedProducts } from "@/components/featured-products";
import { AiAssistant } from "@/components/ai-assistant";
import { getCachedProducts, getCachedCategories } from "@/lib/api-server";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Official Vercel merchandise. Premium developer apparel, accessories, and gear.",
  openGraph: {
    title: "Vercel Swag Store",
    description:
      "Official Vercel merchandise. Premium developer apparel, accessories, and gear.",
  },
};

export default function HomePage() {
  void getCachedProducts({ limit: 20 });
  void getCachedCategories();

  return (
    <>
      <PromoBanner />
      <Hero />
      <AiAssistant />
      <FeaturedProducts />
    </>
  );
}
