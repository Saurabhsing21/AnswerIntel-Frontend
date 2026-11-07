import { expect, test } from "@playwright/test";

test.skip(!process.env.E2E_BACKEND_URL, "needs a running API (E2E_BACKEND_URL)");

test("a new visitor signs up and lands in the app", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/register");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/\/projects/);

  // The session survives a reload: it lives in HttpOnly cookies, not in page memory.
  await page.reload();
  await expect(page).toHaveURL(/\/projects/);
  const me = await page.request.get("/api/backend/auth/me");
  expect(me.status()).toBe(200);
  expect((await me.json()).email).toBe(email);
});
