/** Cart and account contracts that require a real responsive browser. */

import {
  ACCOUNT_ENABLED,
  boxOf,
  expect,
  gotoReady,
  SHOPIFY_MODE,
  test,
} from "./fixtures.ts";

test.describe("Cart presentation", () => {
  test("keeps its truthful mode, controls, responsive grid, and viewport bounds", async ({
    page,
  }) => {
    const response = await gotoReady(page, "/cart");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /^Cart/ })).toBeVisible();
    await expect(
      page.getByText(
        SHOPIFY_MODE
          ? "Your field bag · live Shopify cart"
          : "Your field bag · demo only",
        { exact: true },
      ),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    if (SHOPIFY_MODE) {
      await expect(
        page.getByRole("heading", { name: "Nothing packed yet." }),
      ).toBeVisible();
      await expect(
        page.getByRole("region", { name: "Cart items" }),
      ).toHaveCount(0);
      return;
    }

    const items = page.getByRole("region", { name: "Cart items" });
    const summary = page.getByRole("complementary", {
      name: "Order summary",
    });
    await expect(items).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Checkout — not connected");
    await expect(summary.getByText("Checkout — not connected")).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    const firstLine = items.getByRole("article").first();
    const image = await boxOf(firstLine.getByRole("img"));
    const decrease = await boxOf(
      firstLine.getByRole("button", { name: /^Decrease quantity/ }),
    );
    const quantityFrame = await boxOf(
      firstLine
        .getByRole("button", { name: /^Decrease quantity/ })
        .locator(".."),
    );
    const remove = await boxOf(
      firstLine.getByRole("button", { name: /^Remove/ }),
    );
    /* The accepted 44px bordered quantity frame leaves a 42px inner button. */
    expect(decrease.height).toBeGreaterThanOrEqual(42);
    expect(decrease.width).toBeGreaterThanOrEqual(36);
    expect(remove.height).toBeGreaterThanOrEqual(44);

    const itemBox = await boxOf(items);
    const summaryBox = await boxOf(summary);
    const viewport = page.viewportSize();
    expect(quantityFrame.height).toBe((viewport?.width ?? 0) <= 560 ? 48 : 44);
    if ((viewport?.width ?? 0) > 820) {
      expect(itemBox.x).toBeLessThan(summaryBox.x);
      expect(Math.abs(image.width - 190)).toBeLessThanOrEqual(1);
    } else {
      expect(itemBox.y).toBeLessThan(summaryBox.y);
      expect(Math.abs(image.width - 92)).toBeLessThanOrEqual(1);
    }
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
