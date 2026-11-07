import { expect, test, type Page } from "@playwright/test";

/** Anything the Content-Security-Policy blocked: a third party the site uses but the policy forgot. */
function cspViolations(page: Page) {
  const blocked: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content.Security.Policy/i.test(msg.text())) blocked.push(msg.text());
  });
  return blocked;
}

test("the home page renders without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  const blocked = cspViolations(page);
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(errors).toEqual([]);
  expect(blocked).toEqual([]);
});

test("pricing and legal pages load", async ({ page }) => {
  for (const path of ["/pricing", "/privacy", "/terms"]) {
    expect((await page.goto(path))?.status(), path).toBe(200);
  }
});

test("security headers are sent", async ({ page }) => {
  const res = await page.goto("/");
  const headers = res!.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("the login form is shown, Google sign-in included", async ({ page }) => {
  const blocked = cspViolations(page);
  await page.goto("/login");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(blocked).toEqual([]);
});

test("an unknown page answers 404", async ({ page }) => {
  expect((await page.goto("/no-such-page"))?.status()).toBe(404);
});
