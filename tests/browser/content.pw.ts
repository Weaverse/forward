/**
 * Content and system-state contracts that need a real browser: editorial
 * geometry, responsive stacking, viewport bounds, and the rendered 404.
 */

import { boxOf, expect, gotoReady, test } from "./fixtures.ts";

test.describe("content routes", () => {
  test("keeps the Journal feature, cards, and article structure responsive", async ({
    page,
  }) => {
    await gotoReady(page, "/journal");

    const feature = page.locator('main > a[href^="/journal/"]').first();
    const featureImage = feature.getByRole("img");
    const featureHeading = feature.getByRole("heading", { level: 2 });
    await expect(featureImage).toHaveAttribute(
      "sizes",
      "(min-width: 820px) 66vw, 100vw",
    );
    await expect(featureHeading).toBeVisible();
    await expect(page.locator("main section article")).toHaveCount(5);

    const imageBox = await boxOf(featureImage);
    const headingBox = await boxOf(featureHeading);
    if ((page.viewportSize()?.width ?? 0) > 820) {
      expect(headingBox.x).toBeLessThan(imageBox.x);
    } else {
      expect(imageBox.y).toBeLessThan(headingBox.y);
    }

    const href = await feature.getAttribute("href");
    expect(href).toMatch(/^\/journal\//);
    await gotoReady(page, href ?? "/journal");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main article h2").first()).toBeVisible();
    await expect(page.locator("main article p").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "All field notes" }),
    ).toHaveAttribute("href", "/journal");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? Number.POSITIVE_INFINITY,
    );
  });

  test("keeps custom pages, canonical pages, and policies distinct", async ({
    page,
  }) => {
    await gotoReady(page, "/materials");
    const materialHero = page.getByRole("heading", { level: 1 }).locator("..");
    const materialCopy = await boxOf(materialHero);
    const materialImage = await boxOf(
      page.locator("main > div > section").first().getByRole("img"),
    );
    if ((page.viewportSize()?.width ?? 0) > 820) {
      expect(materialImage.x).toBeLessThan(materialCopy.x);
    } else {
      expect(materialCopy.y).toBeLessThan(materialImage.y);
    }
    await expect(page.locator('main a[href^="/products/"]')).toHaveCount(3);

    await gotoReady(page, "/field-testing");
    await expect(
      page.locator("#main-content ol").getByRole("listitem"),
    ).toHaveCount(4);
    await expect(page.locator("main img").first()).toHaveAttribute(
      "sizes",
      "100vw",
    );

    await gotoReady(page, "/pages/about-forward");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "About Forward",
    );
    await expect(page.locator("main article")).toHaveCount(1);

    await gotoReady(page, "/policies/privacy-policy");
    const policyNav = page.getByRole("navigation", { name: "Store policies" });
    await expect(
      policyNav.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main article section h2")).toHaveCount(3);
    await expect(
      page.getByRole("link", { name: "contact page" }),
    ).toHaveAttribute("href", "/pages/contact");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? Number.POSITIVE_INFINITY,
    );
  });
});

test.describe("system route", () => {
  test.use({
    expectedProblem:
      /^(?:http 404: |console\.error: Failed to load resource: the server responded with a status of 404)/,
  });

  test("keeps the 404 actions accessible and inside the viewport", async ({
    page,
  }) => {
    const response = await page.goto("/__phase-2f-missing__");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This trail ends here.",
    );
    await expect(
      page.getByRole("link", { name: "Return home" }),
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("link", { name: "Explore gear" }),
    ).toHaveAttribute("href", "/shop");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? Number.POSITIVE_INFINITY,
    );
  });
});
