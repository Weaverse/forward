/**
 * Premium presentation contracts that used to be inferred from CSS/TSX text.
 *
 * These checks execute the real production page and assert computed type,
 * responsive geometry, route-owned content, and shopper-visible links so the
 * Tailwind migration can freely change selectors and component structure.
 */

import { boxOf, expect, gotoReady, test } from "./fixtures.ts";

const PDP = "/products/weatherline-shell";

function normalizedFamily(value: string): string {
  return value.replace(/["']/g, "").toLowerCase();
}

test.describe("premium presentation behavior", () => {
  test("binds the accepted display, UI, and field-meta font roles", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    const families = {
      body: await page
        .locator("body")
        .evaluate((node) => getComputedStyle(node).fontFamily),
      display: await page
        .locator("main h1")
        .evaluate((node) => getComputedStyle(node).fontFamily),
      meta: await page
        .getByText("Forward / Field equipment 2026", { exact: true })
        .evaluate((node) => getComputedStyle(node).fontFamily),
    };

    expect(normalizedFamily(families.body)).toContain("manrope");
    expect(normalizedFamily(families.display)).toContain("archivo");
    expect(normalizedFamily(families.meta)).toContain("ibm plex mono");
  });

  test("renders product cards on a uniform responsive grid", async ({
    page,
  }) => {
    const viewport = page.viewportSize();
    await gotoReady(page, "/shop");
    const plpCards = page
      .getByRole("region", { name: "Products" })
      .getByRole("article");
    /* One page, not the whole catalog: paging is the store's cursor. */
    expect(await plpCards.count()).toBeGreaterThan(2);
    const firstPlp = await boxOf(plpCards.nth(0));
    const secondPlp = await boxOf(plpCards.nth(1));
    expect(Math.abs(firstPlp.width - secondPlp.width)).toBeLessThan(2);
    if ((viewport?.width ?? 0) > 820) {
      const thirdPlp = await boxOf(plpCards.nth(2));
      expect(Math.abs(firstPlp.y - secondPlp.y)).toBeLessThan(2);
      expect(Math.abs(firstPlp.y - thirdPlp.y)).toBeLessThan(2);
    } else {
      const thirdPlp = await boxOf(plpCards.nth(2));
      expect(Math.abs(firstPlp.y - secondPlp.y)).toBeLessThan(2);
      expect(thirdPlp.y).toBeGreaterThan(firstPlp.y);
    }
  });

  test("places PDP details and gallery in the accepted responsive order", async ({
    page,
  }) => {
    await gotoReady(page, PDP);
    const panel = await boxOf(
      page.getByRole("region", { name: "Purchase panel" }),
    );
    const gallery = await boxOf(page.getByRole("region", { name: /gallery$/ }));
    const viewport = page.viewportSize();

    if ((viewport?.width ?? 0) > 820) {
      expect(panel.x).toBeLessThan(gallery.x);
    } else {
      expect(gallery.y).toBeLessThan(panel.y);
    }
  });

  test("keeps the catalog free of horizontal overflow", async ({ page }) => {
    await gotoReady(page, "/shop");
    await expect(page.getByRole("region", { name: "Products" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? Number.POSITIVE_INFINITY,
    );
  });

  test("keeps PLP and custom-page content owned by their routes", async ({
    page,
  }) => {
    await gotoReady(page, "/shop");
    /* One results region, whatever else the merchant composed around it. */
    await expect(page.getByRole("region", { name: "Products" })).toHaveCount(1);
    /* Cursor paging means the toolbar counts this page, not the catalog. */
    await expect(
      page.locator('main [aria-live="polite"]').first(),
    ).toContainText(/\d+ products/);
    await expect(
      page.getByText(/No matching plates|full catalog is three/i),
    ).toHaveCount(0);

    /* The three editorial routes are Weaverse-composed and absent without a
     * configured project, so this matrix can only prove the Shopify-owned
     * surfaces keep their own headings. */
    const headings: string[] = [];
    for (const route of ["/pages/about-forward", "/policies/privacy-policy"]) {
      await gotoReady(page, route);
      headings.push((await page.locator("main h1").first().innerText()).trim());
    }
    expect(new Set(headings).size).toBe(2);
  });

  test("preserves catalog query state and responsive filter ownership", async ({
    page,
  }) => {
    /* Facets are the store's, so the assertions are about the contract — a
     * facet param round-trips, an applied value is marked, and the order
     * control carries everything it does not own — never about a particular
     * facet the theme decided to have. */
    await gotoReady(page, "/shop/outerwear?sort=price-desc");

    const sortForm = page.locator('form[action="/shop/outerwear"]').first();
    await expect(sortForm).toHaveAttribute("method", "get");
    await expect(page.getByLabel("Sort")).toHaveValue("price-desc");

    /* Below the desktop breakpoint the facets sit in a disclosure. */
    const facetLinks = page.locator('main a[href*="filter."]:visible');
    if ((await facetLinks.count()) === 0) {
      await page.getByText("Filters", { exact: true }).first().click();
    }
    expect(await facetLinks.count()).toBeGreaterThan(0);

    const href = await facetLinks.first().getAttribute("href");
    expect(href).toContain("sort=price-desc");
    await facetLinks.first().click();
    await expect(page).toHaveURL(/filter\./);
    await expect(page).toHaveURL(/sort=price-desc/);
    await expect(
      page.locator('main a[aria-current="true"]:visible').first(),
    ).toBeVisible();

    /* Clearing is reachable once something is applied. */
    await expect(
      page.getByRole("link", { name: "Clear filters" }).first(),
    ).toBeVisible();

    const tools = sortForm.locator("..");
    expect(
      await tools.evaluate((node) => getComputedStyle(node).position),
    ).toBe("sticky");

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? Number.POSITIVE_INFINITY,
    );
  });

  test("keeps collection composition and search states truthful", async ({
    page,
  }) => {
    await gotoReady(page, "/shop/outerwear");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main img").first()).toHaveAttribute(
      "sizes",
      "(min-width: 820px) 65vw, 100vw",
    );

    await gotoReady(page, "/search");
    const searchForm = page.locator('form[action="/search"]');
    const searchBox = page.getByRole("searchbox", { name: "Search products" });
    await expect(searchForm).toHaveAttribute("method", "get");
    await expect(
      page.getByRole("heading", {
        name: "Search by product, activity, or material.",
      }),
    ).toBeVisible();
    expect((await boxOf(searchBox)).height).toBe(
      (page.viewportSize()?.width ?? 0) <= 560 ? 64 : 110,
    );

    await gotoReady(page, "/search?q=%20shell%20");
    await expect(
      page.getByRole("heading", { name: "Results for “shell”" }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search products" }),
    ).toHaveValue(" shell ");
    await expect(page.locator('main [aria-live="polite"]')).toContainText(
      "found",
    );

    await gotoReady(page, "/search?q=__no_forward_match__");
    await expect(page.locator('main [aria-live="polite"]')).toContainText(
      "0 found",
    );
  });
});
