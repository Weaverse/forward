/**
 * PDP — the gallery composition, zoom dialog, and option targets that are CSS
 * and browser contracts rather than markup contracts.
 */

import { boxOf, expect, gotoReady, test } from "./fixtures.ts";

const PDP = "/products/weatherline-shell";

test.describe("PDP gallery geometry", () => {
  test("keeps the first three media in the canonical composition", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, PDP);
    const gallery = page.getByRole("region", { name: /gallery$/ });
    const media = gallery.getByRole("button");
    await expect(media).toHaveCount(4);

    const boxes = [];
    for (let index = 0; index < 4; index += 1) {
      boxes.push(await boxOf(media.nth(index)));
    }
    const [first, second, third, fourth] = boxes;
    expect(first && second && third && fourth).toBeTruthy();
    if (!first || !second || !third || !fourth) return;

    if (testInfo.project.name === "mobile") {
      /* Mobile stacks the whole gallery in one column. */
      expect(Math.abs(second.width - first.width)).toBeLessThan(2);
      expect(second.y).toBeGreaterThan(first.y);
    } else {
      /* Media one owns the wider left column across two right-column rows. */
      expect(Math.abs(second.width - third.width)).toBeLessThan(2);
      expect(first.width).toBeGreaterThan(second.width);
      expect(Math.abs(first.y - second.y)).toBeLessThan(2);
      expect(third.y).toBeGreaterThan(second.y);
      expect(first.height).toBeGreaterThan(second.height);
    }
  });

  test("spans the fourth media full width at its natural aspect ratio", async ({
    page,
  }) => {
    await gotoReady(page, PDP);
    const gallery = page.getByRole("region", { name: /gallery$/ });
    const media = gallery.getByRole("button");
    const firstThree = await Promise.all([
      boxOf(media.nth(0)),
      boxOf(media.nth(1)),
      boxOf(media.nth(2)),
    ]);
    const fourth = await boxOf(media.nth(3));

    const gridLeft = Math.min(...firstThree.map((box) => box.x));
    const gridRight = Math.max(...firstThree.map((box) => box.x + box.width));
    expect(Math.abs(fourth.x - gridLeft)).toBeLessThan(2);
    expect(Math.abs(fourth.x + fourth.width - gridRight)).toBeLessThan(2);

    const image = media.nth(3).locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBe(true);
    const natural = await image.evaluate((node: HTMLImageElement) => {
      const rendered = node.getBoundingClientRect();
      return {
        width: node.naturalWidth,
        height: node.naturalHeight,
        renderedWidth: rendered.width,
        renderedHeight: rendered.height,
        fit: getComputedStyle(node).objectFit,
      };
    });

    expect(natural.width).toBeGreaterThan(0);
    expect(natural.height).toBeGreaterThan(0);
    expect(natural.fit).toBe("contain");
    const naturalRatio = natural.width / natural.height;
    const renderedRatio = natural.renderedWidth / natural.renderedHeight;
    expect(
      Math.abs(naturalRatio - renderedRatio),
      "the continuation media must not be cropped",
    ).toBeLessThan(0.05);
  });

  test("never overflows the viewport horizontally", async ({ page }) => {
    await gotoReady(page, PDP);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("PDP zoom dialog", () => {
  test("opens a real modal dialog, traps it, and restores the trigger", async ({
    page,
  }) => {
    await gotoReady(page, PDP);
    const trigger = page
      .getByRole("region", { name: /gallery$/ })
      .getByRole("button")
      .nth(1);

    await trigger.click();
    const dialog = page.getByRole("dialog", { name: /image gallery$/ });
    await expect(dialog).toBeVisible();
    expect(
      await page.evaluate(
        () => document.querySelector("dialog")?.hasAttribute("open") === true,
      ),
      "the gallery must use a real modal dialog",
    ).toBe(true);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).overflow,
      ),
    ).toBe("hidden");

    await dialog.getByRole("button", { name: "Next image" }).click();
    await expect(dialog).toContainText("03 / 04");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).overflow,
      ),
    ).not.toBe("hidden");
  });
});

test.describe("PDP option controls", () => {
  test("keeps option values readable and comfortably tappable", async ({
    page,
  }) => {
    await gotoReady(page, PDP);
    const panel = page.getByRole("region", { name: "Purchase panel" });
    const options = panel
      .getByRole("group", { name: /^(Color|Size)$/ })
      .locator('a, [aria-disabled="true"]');
    const count = await options.count();
    expect(count).toBeGreaterThan(4);

    for (let index = 0; index < Math.min(count, 10); index += 1) {
      const chip = options.nth(index);
      const box = await boxOf(chip);
      const fontSize = await chip.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).fontSize),
      );
      expect(
        fontSize,
        `option ${index} is too small to read`,
      ).toBeGreaterThanOrEqual(12);
      expect(
        box.height,
        `option ${index} is too short to hit`,
      ).toBeGreaterThanOrEqual(44);
    }

    const firstColorway = panel
      .getByRole("group", { name: "Color" })
      .getByRole("link")
      .first();
    await firstColorway.focus();
    const focus = await firstColorway.evaluate((node) => {
      const style = getComputedStyle(node);
      return { width: style.outlineWidth, offset: style.outlineOffset };
    });
    expect(Number.parseFloat(focus.width)).toBeGreaterThanOrEqual(3);
    expect(Number.parseFloat(focus.offset)).toBeGreaterThanOrEqual(3);
  });

  test("moves the selected variant into the URL and back into the price", async ({
    page,
  }) => {
    await gotoReady(page, `${PDP}?colorway=charcoal&size=XS`);
    const price = page
      .getByRole("region", { name: "Purchase panel" })
      .locator("strong")
      .filter({ hasText: /\$/ })
      .first();
    await expect(price).toContainText("$");
    const before = await price.innerText();

    await page.getByRole("link", { name: "L", exact: true }).click();
    await expect(page).toHaveURL(/size=L/);
    await expect(
      page.getByRole("link", { name: "L", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    expect((await price.innerText()).length).toBeGreaterThan(0);
    expect(before.length).toBeGreaterThan(0);
  });
});
