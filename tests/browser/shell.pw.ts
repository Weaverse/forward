/**
 * Storefront shell — the parts of the header, footer, and commerce chrome that
 * only a real browser can prove: responsive surfaces, focus geometry, the
 * `inert` background, target sizes, cursor and shadow states, and the
 * mini-cart lifecycle against the cart the deployment actually owns.
 */

import {
  ACCOUNT_ENABLED,
  boxOf,
  expect,
  gotoReady,
  SHOPIFY_MODE,
  test,
} from "./fixtures.ts";

const DESKTOP_NAV_MIN_WIDTH = 1101;

async function isDesktopNav(page: {
  viewportSize(): { width: number; height: number } | null;
}): Promise<boolean> {
  return (page.viewportSize()?.width ?? 0) >= DESKTOP_NAV_MIN_WIDTH;
}

test.describe("shell structure", () => {
  test("renders exactly one header and one footer per page", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator("[data-mini-cart-mount]")).toHaveCount(1);
  });

  test("loads the approved wordmark artwork", async ({ page }) => {
    await gotoReady(page, "/");
    const mark = page
      .getByRole("banner")
      .getByRole("link", { name: "Forward — home" })
      .locator("img");

    await expect(mark).toHaveAttribute(
      "src",
      /forward-wordmark-horizontal-moss\.svg/,
    );
    expect(
      await mark.evaluate((node: HTMLImageElement) => node.naturalWidth),
    ).toBeGreaterThan(0);
  });

  test("offers a working skip link before anything else", async ({ page }) => {
    await gotoReady(page, "/");
    await page.keyboard.press("Tab");

    const focused = page.locator(":focus");
    await expect(focused).toHaveText("Skip to content");
    const box = await boxOf(focused);
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test("states the published market on surfaces wide enough to show it", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const market = page.getByText("United States · USD");

    await expect(market).toBeVisible();
  });
});

test.describe("header navigation surface", () => {
  test("exposes the surface that fits the viewport", async ({ page }) => {
    await gotoReady(page, "/");
    const shopTrigger = page.getByRole("button", { name: /Shop/ });
    const menuTrigger = page.getByRole("button", { name: /^Menu$/ });

    if (await isDesktopNav(page)) {
      await expect(shopTrigger).toBeVisible();
      await expect(menuTrigger).toBeHidden();
    } else {
      await expect(shopTrigger).toBeHidden();
      await expect(menuTrigger).toBeVisible();
    }
  });

  test("marks the current destination across a real navigation", async ({
    page,
  }) => {
    await gotoReady(page, "/shop/packs");

    const marked = page.getByRole("banner").locator('[aria-current="page"]');
    expect(await marked.count()).toBeGreaterThan(0);
    if (await isDesktopNav(page)) {
      await expect(page.getByRole("button", { name: /Shop/ })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("carries destination-owned query state through a real click", async ({
    page,
  }) => {
    test.skip(
      !(await isDesktopNav({ viewportSize: () => page.viewportSize() })),
      "the mega panel is a desktop surface",
    );
    await gotoReady(page, "/shop?sort=name");
    await page.getByRole("button", { name: /Shop/ }).click();

    const packs = page
      .getByRole("navigation", { name: "Shop collections" })
      .getByRole("link", { name: /Packs/ });
    await expect(packs).toHaveAttribute("href", "/shop/packs?sort=name");

    await packs.click();
    await expect(page).toHaveURL(/\/shop\/packs\?sort=name$/);
  });

  test("opens, lays out, and dismisses the desktop field index", async ({
    page,
  }) => {
    test.skip(
      !(await isDesktopNav({ viewportSize: () => page.viewportSize() })),
      "the mega panel is a desktop surface",
    );
    await gotoReady(page, "/");
    const trigger = page.getByRole("button", { name: /Shop/ });

    await trigger.click();
    const panel = page.getByRole("region", { name: "Shop field index" });
    await expect(panel).toBeVisible();

    const panelBox = await boxOf(panel);
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (viewport !== null) {
      expect(panelBox.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(panelBox.x).toBeGreaterThanOrEqual(-1);
    }
    await expect(
      page
        .getByRole("navigation", { name: "Shop collections" })
        .getByRole("link"),
    ).toHaveCount(4);

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("makes the background inert behind the mobile dialog", async ({
    page,
  }) => {
    test.skip(
      await isDesktopNav({ viewportSize: () => page.viewportSize() }),
      "the mobile dialog is a narrow-viewport surface",
    );
    await gotoReady(page, "/");
    await page.getByRole("button", { name: /^Menu$/ }).click();

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Close menu" }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () =>
          document.querySelector<HTMLElement>("#main-content")?.inert === true,
      ),
      "the page behind the dialog must be inert",
    ).toBe(true);
    expect(
      await page.evaluate(() =>
        document.body.classList.contains("overflow-hidden"),
      ),
      "the body must not scroll behind the dialog",
    ).toBe(true);

    const dialogBox = await boxOf(dialog);
    const viewport = page.viewportSize();
    if (viewport !== null) {
      expect(dialogBox.width).toBeLessThanOrEqual(viewport.width + 1);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /^Menu$/ })).toBeFocused();
    expect(
      await page.evaluate(
        () =>
          document.querySelector<HTMLElement>("#main-content")?.inert === true,
      ),
    ).toBe(false);
  });
});

test.describe("interactive affordances", () => {
  test("keeps every colorway swatch at a 44px target", async ({ page }) => {
    await gotoReady(page, "/");
    const swatches = page.locator("main label:has(input[type='radio'])");
    const count = await swatches.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < Math.min(count, 8); index += 1) {
      const box = await boxOf(swatches.nth(index));
      expect(box.width, `swatch ${index} is too narrow`).toBeGreaterThanOrEqual(
        44,
      );
      expect(box.height, `swatch ${index} is too short`).toBeGreaterThanOrEqual(
        44,
      );
    }
  });

  test("gives the primary button one square hard-shadow contract", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, "/");
    const button = page.getByRole("link", { name: "Shop all equipment" });

    const shadowOf = () =>
      button.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          shadow: style.boxShadow,
          radius: style.borderRadius,
          cursor: style.cursor,
        };
      });

    const resting = await shadowOf();
    expect(resting.radius).toMatch(/^0px/);
    expect(resting.cursor).toBe("pointer");
    expect(resting.shadow).toMatch(/4px 4px 0px/);

    if (testInfo.project.name === "mobile") {
      return;
    }

    await button.hover();
    await expect
      .poll(async () => (await shadowOf()).shadow)
      .toMatch(/2px 2px 0px/);

    await page.mouse.down();
    await expect
      .poll(async () => (await shadowOf()).shadow)
      .toMatch(/0px 0px 0px/);
    await page.mouse.up();
  });

  test("shows a not-allowed cursor on a disabled control", async ({ page }) => {
    await gotoReady(page, "/products/weatherline-shell");
    const decrease = page.getByRole("button", { name: "Decrease quantity" });

    await expect(decrease).toBeDisabled();
    expect(
      await decrease.evaluate((node) => getComputedStyle(node).cursor),
    ).toBe("not-allowed");
  });
});

test.describe("footer integration truth", () => {
  test("renders only the deployment mode's truthful status", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const footer = page.getByRole("contentinfo");
    const staticStatus = footer.getByText(
      "Static demonstration storefront · Not a live store",
    );

    if (SHOPIFY_MODE) {
      await expect(staticStatus).toHaveCount(0);
    } else {
      await expect(staticStatus).toBeVisible();
    }
  });

  test("keeps the Footer grid at five or one column at project widths", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, "/");
    const columnCount = await page
      .locator("[data-footer-grid]")
      .evaluate(
        (node) =>
          getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean)
            .length,
      );

    expect(columnCount).toBe(testInfo.project.name === "mobile" ? 1 : 5);
  });

  test("keeps the Footer grid at two columns on tablet", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "one desktop project drives the intermediate tablet width",
    );

    await page.setViewportSize({ width: 768, height: 900 });
    await gotoReady(page, "/");
    const columnCount = await page
      .locator("[data-footer-grid]")
      .evaluate(
        (node) =>
          getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean)
            .length,
      );
    expect(columnCount).toBe(2);
  });

  test("publishes only verified accounts and no unconfigured controls", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const footer = page.getByRole("contentinfo");

    const social = footer.getByRole("link", { name: /^Weaverse on / });
    await expect(social).toHaveCount(4);
    for (const link of await social.all()) {
      const href = await link.getAttribute("href");
      const rel = (await link.getAttribute("rel")) ?? "";
      expect(href).toMatch(/^https:\/\//);
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
      expect(rel).toContain("external");
      expect(rel).not.toContain("me");
    }

    /* Nothing may claim a payment method or a newsletter that is not wired. */
    await expect(footer.locator("form, input")).toHaveCount(0);
    await expect(
      footer.getByText(/visa|mastercard|amex|paypal|klaviyo|shop pay/i),
    ).toHaveCount(0);
  });

  test("groups the theme-owned pages under their own heading", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const guide = page.getByRole("navigation", {
      name: "Forward field guide links",
    });

    await expect(
      guide.getByRole("heading", { name: "Field guide" }),
    ).toBeVisible();
    expect(
      await guide
        .getByRole("link")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
    ).toEqual(["/about", "/materials", "/field-testing"]);
  });

  test("gates the Account affordance on the deployment's configuration", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const accountLinks = page.locator('a[href="/account"]');

    if (ACCOUNT_ENABLED) {
      expect(await accountLinks.count()).toBeGreaterThan(0);
    } else {
      await expect(accountLinks).toHaveCount(0);
    }
  });
});

test.describe("mini-cart lifecycle", () => {
  test("opens on a successful add, merges a repeat add, and dismisses", async ({
    page,
  }) => {
    await gotoReady(page, "/products/weatherline-shell");
    const add = page.getByRole("button", { name: /^Add to cart/ });
    await expect(add).toBeEnabled();

    await add.click();
    const panel = page.getByRole("dialog", { name: "Cart updated" });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Qty 1");
    await expect(
      panel.getByRole("link", { name: "View cart" }),
    ).toHaveAttribute("href", "/cart");
    /* The Shopify form may replace its submit node after a successful request;
     * the non-modal panel still must not pull focus into itself. */
    expect(
      await panel.evaluate((node) => !node.contains(document.activeElement)),
    ).toBe(true);

    const viewport = page.viewportSize();
    const box = await boxOf(panel);
    if (viewport !== null) {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    }

    await add.click();
    await expect(panel).toContainText("Qty 2");
    await expect(
      page.getByRole("dialog", { name: "Cart updated" }),
    ).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });
});
