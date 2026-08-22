/**
 * Runtime health — repeated navigation cycles, console/network cleanliness
 * across the route inventory, the boolean-only account probe, and the
 * deliberate 404.
 */

import {
  ACCOUNT_ENABLED,
  expect,
  gotoReady,
  MATRIX,
  test,
} from "./fixtures.ts";

const TOUR = [
  "/",
  "/shop",
  "/shop/outerwear",
  "/products/weatherline-shell",
  "/search?q=shell",
  "/journal",
  "/cart",
  "/about",
  "/policies/privacy-policy",
] as const;

test.describe("route health", () => {
  test("serves every representative route cleanly", async ({ page }) => {
    for (const path of TOUR) {
      const response = await gotoReady(page, path);
      expect(response?.status(), `${path} did not answer 200`).toBe(200);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.locator("#main-content")).toBeVisible();
    }
  });

  test("survives repeated navigation cycles without leaking shell state", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (const path of [
        "/shop",
        "/products/weatherline-shell",
        "/cart",
        "/",
      ]) {
        await gotoReady(page, path);
        await expect(page.getByRole("banner")).toHaveCount(1);
        await expect(page.locator(".mini-cart-mount")).toHaveCount(1);
        await expect(
          page.getByRole("dialog", { name: "Site menu" }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("region", { name: "Shop field index" }),
        ).toHaveCount(0);
        expect(
          await page.evaluate(() => document.body.classList.contains("locked")),
          `${path} left the body locked`,
        ).toBe(false);
      }
    }
  });
});

test.describe("account state probe", () => {
  test("answers the mode-appropriate uncacheable session boundary", async ({
    request,
  }) => {
    const response = await request.get("/account/status");
    if (!ACCOUNT_ENABLED) {
      expect(response.status()).toBe(404);
      return;
    }

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["cdn-cache-control"]).toBeUndefined();
    expect(response.headers()["surrogate-control"]).toBeUndefined();

    const body = (await response.json()) as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(["signedIn"]);
    expect(typeof body.signedIn).toBe("boolean");
    expect(body.signedIn).toBe(false);
  });

  test("matches the deployment's configured account mode", async ({ page }) => {
    await gotoReady(page, "/");
    const links = page.locator('a[href="/account"]');

    if (ACCOUNT_ENABLED) {
      expect(
        await links.count(),
        `${MATRIX} must publish the Account destination`,
      ).toBeGreaterThan(0);
    } else {
      expect(
        await links.count(),
        `${MATRIX} must not advertise an unavailable Account destination`,
      ).toBe(0);
    }
  });
});

test.describe("unknown routes", () => {
  test.use({
    expectedProblem:
      /^(?:http 404: |console\.error: Failed to load resource: the server responded with a status of 404)/,
  });

  test("answers an accessible 404 without breaking the shell", async ({
    page,
  }) => {
    const response = await page.goto("/__forward-missing__");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
