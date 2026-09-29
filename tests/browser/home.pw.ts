/**
 * Home — the layout contracts only a browser proves.
 *
 * Home is composed in Weaverse, so its sections, copy and links are whatever
 * the merchant authored and are not asserted here. What the theme owns is:
 * every image carries an alternative attribute and a responsive size hint, the
 * page never scrolls horizontally, Journal cards share a baseline, and reduced
 * motion removes transition time.
 */

import { boxOf, expect, gotoReady, test } from "./fixtures.ts";

test.describe("Home images", () => {
  test("gives every image an alternative attribute and a responsive size hint", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const images = page.locator("main img");
    const count = await images.count();

    for (let index = 0; index < count; index += 1) {
      const image = images.nth(index);
      /* An empty alternative marks a decorative image, which is the author's
       * call; a missing attribute never is. */
      expect(
        await image.getAttribute("alt"),
        `image ${index} has no alt attribute`,
      ).not.toBeNull();
      expect(
        await image.getAttribute("sizes"),
        `image ${index} has no sizes hint`,
      ).toBeTruthy();
    }
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
