import { test, expect } from "@playwright/test";

test.describe("Product Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
    await page.locator("a[href^='/products/']").first().click();
    await page.waitForURL(/\/products\//);
  });

  test("displays product name and price", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("p").filter({ hasText: /^\$\d/ }).first()).toBeVisible();
  });

  test("displays product image", async ({ page }) => {
    const img = page.locator("img").first();
    await expect(img).toBeVisible();
  });

  test("displays stock indicator", async ({ page }) => {
    const stockBadge = page.locator("text=/in stock|out of stock|low stock|unavailable/i");
    await expect(stockBadge).toBeVisible({ timeout: 15000 });
  });

  test("has quantity selector with +/- buttons", async ({ page }) => {
    await expect(page.getByLabel("Decrease quantity")).toBeVisible();
    await expect(page.getByLabel("Increase quantity")).toBeVisible();
  });

  test("has Add to Cart button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addButton).toBeVisible({ timeout: 15000 });
  });

  test("add to cart flow works", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add to cart/i });
    await addButton.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000);

    if (await addButton.isDisabled()) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await addButton.click();
    const feedback = page.getByText("Added to Cart!").or(page.getByText("Adding..."));
    await expect(feedback).toBeVisible({ timeout: 15000 });
  });
});
