export async function onRequestError() {
  // Required export — intentionally empty
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const {
      getCachedProducts,
      getCachedFeaturedProducts,
      getCachedCategories,
      getCachedActivePromotion,
      getCachedProduct,
    } = await import("@/lib/api-server");

    try {
      const [allProducts, , categories] = await Promise.all([
        getCachedProducts({ limit: 100 }),
        getCachedFeaturedProducts(),
        getCachedCategories(),
        getCachedActivePromotion(),
      ]);

      await Promise.all([
        // Pre-warm all category filter results
        ...categories.map((cat) =>
          getCachedProducts({ category: cat.slug, limit: 20 }),
        ),
        // Pre-warm individual product caches by both slug and ID
        ...allProducts.data.flatMap((p) => [
          getCachedProduct(p.slug),
          getCachedProduct(p.id),
        ]),
      ]);
    } catch {
      // Best-effort cache warming — don't block server start
    }
  }
}
