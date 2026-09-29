/**
 * Market routing as a shopper meets it: the default market has no prefix, a
 * chosen market keeps its prefix through navigation, and the account
 * boundary answers exactly as it does without one.
 */

import { ACCOUNT_ENABLED, expect, gotoReady, test } from "./fixtures.ts";

test.describe("locale routing", () => {
  test("redirects an explicit default locale to the unprefixed URL", async ({
    page,
  }) => {
    await gotoReady(page, "/en-us/shop?sort=name");
    await expect(page).toHaveURL(/\/shop\?sort=name$/);
    expect(new URL(page.url()).pathname).toBe("/shop");
  });

  test("keeps a chosen market's prefix on every internal link", async ({
    page,
  }) => {
    await gotoReady(page, "/de-de/shop/outerwear");
    await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");

    const internal = await page
      .locator('main a[href^="/"], header a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );
    expect(internal.length).toBeGreaterThan(0);
    for (const href of internal) {
      expect(href, `${href} lost its market`).toMatch(/^\/de-de(\/|$|\?)/);
      expect(href).not.toMatch(/^\/de-de\/de-de/);
    }
  });

  test("switches market on the current page from the topbar", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "the market selector sits in the topbar, which mobile hides",
    );
    await gotoReady(page, "/shop/outerwear");
    await page.getByRole("button", { name: /Change shipping market/ }).click();
    await page.getByRole("link", { name: "Germany (EUR €)" }).click();
    await expect(page).toHaveURL(/\/de-de\/shop\/outerwear$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
  });

  test("keeps the account boundary under a market prefix", async ({
    request,
  }) => {
    const response = await request.get("/de-de/account", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(ACCOUNT_ENABLED ? 200 : 404);
  });
});

test.describe("unknown locale prefix", () => {
  test.use({
    expectedProblem:
      /^(?:http 404: |console\.error: Failed to load resource: the server responded with a status of 404)/,
  });

  test("answers an unknown prefix as a missing page", async ({ page }) => {
    const response = await page.goto("/xx-yy/shop");
    expect(response?.status()).toBe(404);
  });
});
