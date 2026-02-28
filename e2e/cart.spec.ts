import { test, expect } from "@playwright/test";

async function addFirstProductToCart(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForSelector("a[href^='/products/']", { timeout: 15000 });
  await page.locator("a[href^='/products/']").first().click();
  await page.waitForURL(/\/products\//);

  const addButton = page.getByRole("button", { name: /add to cart/i });
  await addButton.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1000);

  if (await addButton.isDisabled()) {
    return false;
  }

  await addButton.click();
  await page.waitForTimeout(2000);
  return true;
}

test.describe("Cart Functionality", () => {
  test("can add an item and see it in the cart", async ({ page }) => {
    const added = await addFirstProductToCart(page);
    if (!added) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await page.getByLabel(/cart/i).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible({ timeout: 5000 });
  });

  test("cart displays subtotal", async ({ page }) => {
    const added = await addFirstProductToCart(page);
    if (!added) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await page.getByLabel(/cart/i).click();
    await expect(page.getByText("Subtotal")).toBeVisible({ timeout: 5000 });
  });

  test("can adjust quantity in cart", async ({ page }) => {
    const added = await addFirstProductToCart(page);
    if (!added) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await page.getByLabel(/cart/i).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible({ timeout: 5000 });

    const increaseBtn = page.getByLabel("Increase quantity");
    await increaseBtn.click();
    await page.waitForTimeout(1000);
  });

  test("can remove item from cart", async ({ page }) => {
    const added = await addFirstProductToCart(page);
    if (!added) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await page.getByLabel(/cart/i).click();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible({ timeout: 5000 });

    const removeBtn = page.getByLabel(/remove/i);
    await removeBtn.click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible({ timeout: 5000 });
  });

  test("cart persists after page refresh", async ({ page }) => {
    const added = await addFirstProductToCart(page);
    if (!added) {
      test.skip(true, "Product is out of stock");
      return;
    }

    await page.reload();
    await page.waitForTimeout(3000);

    const badge = page.locator("header span").filter({ hasText: /^[1-9]$/ });
    await expect(badge).toBeVisible({ timeout: 10000 });
  });
});
