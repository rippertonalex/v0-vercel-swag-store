import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header has Home and Shop links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Home" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop" }).first()).toBeVisible();
  });

  test("Home link navigates to homepage", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("link", { name: "Home" }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("Shop link navigates to search page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Shop" }).first().click();
    await expect(page).toHaveURL("/search");
  });

  test("cart icon is in the header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/cart/i)).toBeVisible();
  });

  test("404 page shows for invalid product slug", async ({ page }) => {
    await page.goto("/products/this-product-does-not-exist-12345");
    await expect(page.getByText("404")).toBeVisible({ timeout: 15000 });
  });

  test("footer displays copyright", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/© 2026/)).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu toggle works", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Toggle menu").click();
    await expect(page.getByRole("link", { name: "Home" }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop" }).last()).toBeVisible();
  });

  test("mobile menu links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Toggle menu").click();
    await page.getByRole("link", { name: "Shop" }).last().click();
    await expect(page).toHaveURL("/search");
  });
});
