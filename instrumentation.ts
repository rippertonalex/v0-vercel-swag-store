export async function onRequestError() {
  // Required export — intentionally empty
}

async function warmInBatches(
  tasks: (() => Promise<unknown>)[],
  concurrency = 6,
) {
  for (let i = 0; i < tasks.length; i += concurrency) {
    await Promise.allSettled(tasks.slice(i, i + concurrency).map((t) => t()));
  }
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
      const results = await Promise.allSettled([
        getCachedProducts({ limit: 100 }),
        getCachedProducts({ limit: 20 }),
        getCachedFeaturedProducts(),
        getCachedCategories(),
        getCachedActivePromotion(),
      ]);

      const allProducts =
        results[0].status === "fulfilled" ? results[0].value : null;
      const categories =
        results[3].status === "fulfilled" ? results[3].value : null;

      const tasks: (() => Promise<unknown>)[] = [];

      if (categories) {
        for (const cat of categories) {
          tasks.push(() =>
            getCachedProducts({ category: cat.slug, limit: 20 }),
          );
        }
      }

      if (allProducts) {
        for (const p of allProducts.data) {
          tasks.push(() => getCachedProduct(p.slug));
          tasks.push(() => getCachedProduct(p.id));
        }
      }

      await warmInBatches(tasks);
    } catch {
      // Best-effort — don't block server start
    }
  }
}
