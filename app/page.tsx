import { Hero } from "@/components/hero";
import { PromoBanner } from "@/components/promo-banner";
import { FeaturedProducts } from "@/components/featured-products";

export default function HomePage() {
  return (
    <>
      <PromoBanner />
      <Hero />
      <FeaturedProducts />
    </>
  );
}
