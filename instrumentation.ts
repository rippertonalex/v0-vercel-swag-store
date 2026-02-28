export async function onRequestError() {
  // Required export — intentionally empty
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getProducts, getCategories, getActivePromotion } = await import(
      "@/lib/api"
    );

    // Fire all cache-warming requests in parallel on server boot
    Promise.all([
      getProducts({ limit: 20 }),
      getProducts({ featured: true, limit: 6 }),
      getCategories(),
      getActivePromotion(),
    ]).catch(() => {
      // Silently handle — cache warming is best-effort
    });
  }
}
