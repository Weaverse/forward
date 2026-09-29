/** Cart and account contracts that require a real responsive browser. */

import { ACCOUNT_ENABLED, boxOf, expect, gotoReady, test } from "./fixtures.ts";

test.describe("Cart presentation", () => {
  test("keeps its truthful mode, controls, responsive grid, and viewport bounds", async ({
    page,
  }) => {
    const response = await gotoReady(page, "/cart");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /^Cart/ })).toBeVisible();
    await expect(
      page.getByText("Your field bag · live Shopify cart", { exact: true }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(
      page.getByRole("heading", { name: "Nothing packed yet." }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Cart items" })).toHaveCount(
      0,
    );

    /* The empty cart's primary CTA exercises the real Tailwind cascade.
     * Class-order assertions cannot prove which box shadow wins. */
    const emptyCartCta = page.getByRole("link", {
      name: "Explore all gear",
    });
    await expect(emptyCartCta).toBeVisible();
    const primaryStyles = await emptyCartCta.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        boxShadow: style.boxShadow,
        outlineColor: style.outlineColor,
      };
    });
    // The primary CTA is the yellow fill with the ink shadow: the shadow has
    // to be the colour the fill is not, or the offset block disappears into
    // the button.
    expect(primaryStyles.boxShadow).toContain("rgb(17, 19, 15)");
    expect(primaryStyles.boxShadow).not.toContain("rgb(217, 255, 87)");

    // Enter through the real keyboard tab order; programmatic `.focus()` does
    // not necessarily activate the browser's `:focus-visible` heuristic, and
    // the number of Header controls differs by viewport.
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    for (let step = 0; step < 20; step += 1) {
      await page.keyboard.press("Tab");
      if (
        await emptyCartCta.evaluate((node) => document.activeElement === node)
      ) {
        break;
      }
    }
    await expect(emptyCartCta).toBeFocused();
    await expect
      .poll(() =>
        emptyCartCta.evaluate((node) => getComputedStyle(node).outlineColor),
      )
      .toBe("rgb(17, 19, 15)");
  });
});

test.describe("Account presentation", () => {
  test("keeps the private signed-out boundary and responsive navigation", async ({
    page,
  }) => {
    test.skip(!ACCOUNT_ENABLED, "account UI is intentionally disabled");

    const response = await gotoReady(page, "/account");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["cache-control"]).toContain("private");
    expect(response?.headers()["cache-control"]).toContain("no-store");

    const navigation = page.getByRole("navigation", {
      name: "Account navigation",
    });
    const accessHeading = page.getByRole("heading", {
      name: "Sign in to continue.",
    });
    const accessPanel = accessHeading.locator("..");
    const signIn = page.getByRole("link", { name: "Sign in", exact: true });

    await expect(navigation).toBeVisible();
    await expect(accessHeading).toBeVisible();
    await expect(signIn).toHaveAttribute(
      "href",
      "/account/login?return_to=%2Faccount",
    );
    await expect(signIn).toHaveAttribute("data-prefetch", "false");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    const navigationBox = await boxOf(navigation);
    const accessBox = await boxOf(accessPanel);
    const viewport = page.viewportSize();
    if ((viewport?.width ?? 0) > 820) {
      expect(navigationBox.x).toBeLessThan(accessBox.x);
    } else {
      expect(navigationBox.y).toBeLessThan(accessBox.y);
    }
  });
});
