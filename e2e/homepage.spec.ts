import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("displays hero section with headline and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse all products/i })).toBeVisible();
  });

  test("displays promotional banner", async ({ page }) => {
    await page.goto("/");
    const banner = page.locator("[class*='bg-foreground']").first();
    await expect(banner).toBeVisible({ timeout: 15000 });
  });

  test("displays at least 6 featured products", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
    const productLinks = page.locator("a[href^='/products/']");
    expect(await productLinks.count()).toBeGreaterThanOrEqual(6);
  });

  test("featured products link to product detail pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
    const firstProduct = page.locator("a[href^='/products/']").first();
    const href = await firstProduct.getAttribute("href");
    expect(href).toMatch(/^\/products\/.+/);
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Home|Vercel Swag Store/i);
  });

  test("includes meta generator tag", async ({ page }) => {
    await page.goto("/");
    const content = await page.getAttribute('meta[name="generator"]', "content");
    expect(content).toBe("vswag-cert-v3");
  });
});
