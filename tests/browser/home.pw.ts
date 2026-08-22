/**
 * Home — rendered composition and the layout contracts only a browser proves.
 *
 * Section order, links, media hints, and copy are read from the real page.
 * Everything else here is geometry: the one-viewport desktop bound, the short
 * desktop bound, natural mobile stacking, no horizontal overflow, Journal card
 * alignment, and reduced motion.
 */

import { CATALOG_PRESENTATION_PROFILES } from "../../src/lib/storefront/catalog-presentation.ts";
import { boxOf, expect, gotoReady, SHOPIFY_MODE, test } from "./fixtures.ts";

/** Headings the theme owns, at their exact position in the page outline. */
const FIXED_HEADINGS: Readonly<Record<number, string>> = {
  0: "Equipment for weather that changes the plan.",
  1: "Start with the core four.",
  2: "Built separately. Better together.",
  4: "Fewer materials. Better understood.",
  5: "Carry the day, not the doubt.",
  6: "Keep equipment in motion.",
};

function subtitleFor(handle: string): string {
  const profile = CATALOG_PRESENTATION_PROFILES.find(
    (entry) => entry.handle === handle,
  );
  if (profile === undefined) throw new Error(`no profile for ${handle}`);
  return profile.subtitle;
}

test.describe("Home composition", () => {
  test("keeps the exact accepted section and heading order", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    const headings = await page.locator("main h1, main h2").allTextContents();
    expect(headings).toHaveLength(8);
    for (const [index, text] of Object.entries(FIXED_HEADINGS)) {
      expect(headings[Number(index)]?.trim()).toBe(text);
    }
    /* Slots 3 and 7 are the live spotlight product and latest dispatch. */
    expect(headings[3]?.trim().length).toBeGreaterThan(0);
    expect(headings[7]?.trim().length).toBeGreaterThan(0);
  });

  test("merchandises with the theme's concise summaries, never the full description", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const body = (await page.locator("main").innerText()).replace(/\s+/g, " ");

    expect(body).toContain(subtitleFor("drift-insulated-vest"));
    expect(body).toContain(subtitleFor("approach-18-day-pack"));
    /* Authored short, never clipped from arbitrary copy at runtime. */
    expect(body).not.toMatch(/…|\.\.\./);
  });

  test("links the spotlight and kit to their exact products", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    await expect(
      page.locator('main a[href="/products/drift-insulated-vest"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('main a[href^="/products/approach-18-day-pack"]'),
    ).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Shop all equipment" }),
    ).toHaveAttribute("href", "/shop");
  });

  test("gives every Home image an alternative and a responsive size hint", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const images = page.locator("main img");
    const count = await images.count();
    expect(count).toBeGreaterThan(5);

    for (let index = 0; index < count; index += 1) {
      const image = images.nth(index);
      const alt = await image.getAttribute("alt");
      const sizes = await image.getAttribute("sizes");
      expect(alt, `image ${index} has no alternative`).toBeTruthy();
      expect(sizes, `image ${index} has no sizes hint`).toBeTruthy();
      if (!SHOPIFY_MODE) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        expect(
          await image.evaluate((node: HTMLImageElement) => node.naturalWidth),
          `image ${index} did not load`,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("advertises the accepted spotlight and kit image widths", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    const spotlight = page
      .locator("main section")
      .filter({ hasText: subtitleFor("drift-insulated-vest") })
      .locator("img")
      .first();
    await expect(spotlight).toHaveAttribute(
      "sizes",
      "(min-width: 820px) 60vw, 100vw",
    );

    const kit = page
      .locator("main section")
      .filter({ hasText: "Carry the day, not the doubt." })
      .locator("img")
      .first();
    await expect(kit).toHaveAttribute("sizes", "(min-width: 820px) 20vw, 45vw");
  });

  test("stacks the Shop by system label above its heading", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    const label = page.getByText("Shop by system", { exact: true });
    const heading = page.getByRole("heading", {
      name: "Built separately. Better together.",
    });
    const labelBox = await boxOf(label);
    const headingBox = await boxOf(heading);

    expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(headingBox.y + 1);
    expect(Math.abs(labelBox.x - headingBox.x)).toBeLessThan(2);
  });
});

test.describe("Home geometry", () => {
  test("never scrolls horizontally", async ({ page }) => {
    await gotoReady(page, "/");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("bounds Spotlight and Kit to one viewport on desktop and lets mobile grow", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, "/");
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (viewport === null) return;

    const sections = [
      page
        .locator("main section")
        .filter({ hasText: subtitleFor("drift-insulated-vest") })
        .first(),
      page
        .locator("main section")
        .filter({ hasText: "Carry the day, not the doubt." })
        .first(),
    ];

    for (const section of sections) {
      const box = await boxOf(section);
      if (testInfo.project.name === "mobile") {
        /* Mobile stacks at natural content height rather than being clipped. */
        expect(box.height).toBeGreaterThan(0);
        expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
      } else {
        expect(
          box.height,
          `${testInfo.project.name} must keep the section within one viewport`,
        ).toBeLessThanOrEqual(viewport.height + 1);
      }
    }
  });

  test("keeps every Journal card on one baseline", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "the Journal grid is a single column on mobile, so there is no row to stagger",
    );
    await gotoReady(page, "/journal");

    const cards = page.locator("main article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);

    const tops: number[] = [];
    for (let index = 0; index < Math.min(count, 3); index += 1) {
      tops.push((await boxOf(cards.nth(index))).y);
    }
    const first = tops[0] ?? 0;
    const sameRow = tops.filter((top) => Math.abs(top - first) < 200);
    expect(
      Math.max(...sameRow) - Math.min(...sameRow),
      "no Journal card may be offset from its row",
    ).toBeLessThan(2);
  });
});

test.describe("Home reduced motion", () => {
  test("removes transition and animation time", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/");

    const durations = await page.evaluate(() =>
      [...document.querySelectorAll("main a, main img, main article")]
        .slice(0, 60)
        .map((node) => {
          const style = getComputedStyle(node);
          return [style.transitionDuration, style.animationDuration].join(" ");
        }),
    );

    for (const duration of durations) {
      expect(duration).not.toMatch(/(?:^|\s)0\.[1-9]\d*s/);
      expect(duration).not.toMatch(/(?:^|\s)[1-9]\d*(?:\.\d+)?s/);
    }
  });
});
