import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("shows default products when no search is performed", async ({ page }) => {
    await page.goto("/search");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
    const products = page.locator("a[href^='/products/']");
    expect(await products.count()).toBeGreaterThan(0);
  });

  test("search input exists", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("input[type='search']")).toBeVisible();
  });

  test("search button triggers search", async ({ page }) => {
    await page.goto("/search");
    await page.locator("input[type='search']").fill("hoodie");
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.waitForURL(/q=hoodie/, { timeout: 10000 });
    expect(page.url()).toContain("q=hoodie");
  });

  test("pressing Enter triggers search", async ({ page }) => {
    await page.goto("/search");
    await page.locator("input[type='search']").fill("black");
    await page.locator("input[type='search']").press("Enter");
    await page.waitForURL(/q=black/, { timeout: 10000 });
    expect(page.url()).toContain("q=black");
  });

  test("auto-search triggers after 3+ characters", async ({ page }) => {
    await page.goto("/search");
    await page.locator("input[type='search']").fill("mug");
    await page.waitForURL(/q=mug/, { timeout: 10000 });
    expect(page.url()).toContain("q=mug");
  });

  test("search results limited to 5 when query is active", async ({ page }) => {
    await page.goto("/search?q=black");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
    const products = page.locator("a[href^='/products/']");
    expect(await products.count()).toBeLessThanOrEqual(5);
  });

  test("category filter changes results", async ({ page }) => {
    await page.goto("/search");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });

    await page.getByLabel("Filter by category").click();
    await page.getByRole("option", { name: /hats/i }).click();

    await page.waitForURL(/category=hats/, { timeout: 10000 });
    expect(page.url()).toContain("category=hats");
  });

  test("empty state shows message for no results", async ({ page }) => {
    await page.goto("/search?q=xyznonexistent12345");
    await expect(page.getByText(/no products found/i)).toBeVisible({ timeout: 15000 });
  });

  test("search state persists on refresh", async ({ page }) => {
    await page.goto("/search?q=hoodie&category=hoodies");
    await page.reload();
    expect(page.url()).toContain("q=hoodie");
    expect(page.url()).toContain("category=hoodies");
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveTitle(/Search/i);
  });
});
