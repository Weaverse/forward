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
        .locator("main .eyebrow")
        .first()
        .evaluate((node) => getComputedStyle(node).fontFamily),
    };

    expect(normalizedFamily(families.body)).toContain("manrope");
    expect(normalizedFamily(families.display)).toContain("archivo");
    expect(normalizedFamily(families.meta)).toContain("ibm plex mono");
  });

  test("renders ordinal-free 4:5 product cards on uniform responsive grids", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const homeCards = page.locator(".home-featured-grid .product-card");
    expect(await homeCards.count()).toBe(4);
    expect((await homeCards.allTextContents()).join(" ")).not.toMatch(
      /plate\s+\d+/i,
    );

    const firstHomeImage = await boxOf(homeCards.first().locator("img"));
    expect(
      Math.abs(firstHomeImage.width / firstHomeImage.height - 0.8),
    ).toBeLessThan(0.02);

    const firstHome = await boxOf(homeCards.nth(0));
    const secondHome = await boxOf(homeCards.nth(1));
    expect(Math.abs(firstHome.width - secondHome.width)).toBeLessThan(2);

    const viewport = page.viewportSize();
    if ((viewport?.width ?? 0) > 820) {
      expect(Math.abs(firstHome.y - secondHome.y)).toBeLessThan(2);
    } else {
      const thirdHome = await boxOf(homeCards.nth(2));
      expect(Math.abs(firstHome.y - secondHome.y)).toBeLessThan(2);
      expect(thirdHome.y).toBeGreaterThan(firstHome.y);
    }

    await gotoReady(page, "/shop");
    const plpCards = page
      .getByRole("region", { name: "Products" })
      .locator(".product-card");
    expect(await plpCards.count()).toBe(9);
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
    const panel = await boxOf(page.locator(".product-panel"));
    const gallery = await boxOf(page.locator(".gallery"));
    const viewport = page.viewportSize();

    if ((viewport?.width ?? 0) > 820) {
      expect(panel.x).toBeLessThan(gallery.x);
    } else {
      expect(gallery.y).toBeLessThan(panel.y);
    }

    await page.getByText("Repair", { exact: true }).click();
    const repairLink = page.getByRole("link", {
      name: "The repairs programme",
    });
    await expect(repairLink).toBeVisible();
    await expect(repairLink).toHaveAttribute("href", "/pages/field-repair");
  });

  test("stacks the Home and page heroes without horizontal overflow", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const hero = page.locator(".commerce-hero");
    const heroCopy = await boxOf(hero.locator(".commerce-hero-copy"));
    const heroMedia = await boxOf(hero.locator(".commerce-hero-media"));
    const viewport = page.viewportSize();

    if ((viewport?.width ?? 0) > 820) {
      expect(heroCopy.x).toBeLessThan(heroMedia.x);
    } else {
      expect(heroCopy.y).toBeLessThan(heroMedia.y);
      expect(heroMedia.height).toBeGreaterThan((viewport?.height ?? 1) * 0.6);
    }

    await gotoReady(page, "/shop");
    const pageHero = page
      .getByRole("heading", { name: "Field goods for moving outside." })
      .locator("../..");
    const lead = await boxOf(pageHero.locator(":scope > div"));
    const lede = await boxOf(pageHero.locator(":scope > p"));
    if ((viewport?.width ?? 0) > 820) {
      expect(lead.x).toBeLessThan(lede.x);
    } else {
      expect(lead.y).toBeLessThan(lede.y);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport?.width ?? Number.POSITIVE_INFINITY);
  });

  test("keeps PLP and custom-page content owned by their routes", async ({
    page,
  }) => {
    await gotoReady(page, "/shop");
    await expect(page.getByRole("heading", { name: "Products" })).toHaveCount(
      1,
    );
    await expect(
      page.locator('main [aria-live="polite"]').first(),
    ).toContainText("9 products");
    await expect(
      page.getByText(/No matching plates|full catalog is three/i),
    ).toHaveCount(0);

    const headings: string[] = [];
    for (const route of [
      "/about",
      "/materials",
      "/field-testing",
      "/pages/about-forward",
    ]) {
      await gotoReady(page, route);
      headings.push((await page.locator("main h1").first().innerText()).trim());
    }
    expect(new Set(headings).size).toBe(4);
  });

  test("preserves catalog query state and responsive filter ownership", async ({
    page,
  }) => {
    await gotoReady(
      page,
      "/shop?category=packs&activity=trail&sort=price-desc",
    );

    const sortForm = page.locator('form[action="/shop"]');
    await expect(sortForm).toHaveAttribute("method", "get");
    await expect(sortForm.locator('input[name="category"]')).toHaveValue(
      "packs",
    );
    await expect(sortForm.locator('input[name="activity"]')).toHaveValue(
      "trail",
    );
    await expect(page.getByLabel("Sort")).toHaveValue("price-desc");

    for (const name of [/^packs$/i, /^trail$/i]) {
      const selected = page.locator("main a").filter({ hasText: name });
      await expect(selected).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(selected.nth(index)).toHaveAttribute(
          "aria-current",
          "page",
        );
      }
    }
    await expect(
      page
        .locator("main a")
        .filter({ hasText: /^All categories$/ })
        .first(),
    ).not.toHaveAttribute("aria-current", "page");

    const tools = sortForm.locator("..");
    expect(
      await tools.evaluate((node) => getComputedStyle(node).position),
    ).toBe("sticky");

    if ((page.viewportSize()?.width ?? 0) <= 820) {
      await page.getByText("Filters", { exact: true }).click();
      await expect(
        page.getByRole("link", { name: /^packs$/i }).last(),
      ).toBeVisible();
    }

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
    await expect(page.getByText("The system", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "A focused kit for a full day out.",
      }),
    ).toBeVisible();
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
