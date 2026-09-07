/**
 * PDP commerce behavior.
 *
 * Selection, price, sale, sold-out, option readability, gallery composition,
 * zoom accessibility, and add-to-cart identity are all asserted from the
 * rendered accessibility tree. Gallery *geometry* is a CSS contract and lives
 * in `tests/browser/`.
 */

import assert from "node:assert/strict";
import { describe, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductDetail } from "@/app/products/[productHandle]/product-detail";
import { getCartSnapshot } from "@/lib/demo-cart/store";
import { formatMoney } from "@/lib/storefront/format";
import type { Money, Product } from "@/lib/storefront/types";
import { productByHandle, visibleText } from "./harness";
import { currentRoute, setRoute } from "./preload";

const SHELL = productByHandle("weatherline-shell");
const USD = (amount: number): Money => ({ amount, currencyCode: "USD" });

/** The rendered money string, escaped for a regular expression. */
function money(amount: number): string {
  return formatMoney(USD(amount)).replace(/[$.]/g, (match) => `\\${match}`);
}

function withVariants(
  product: Product,
  update: (
    variant: Product["variants"][number],
    index: number,
  ) => Product["variants"][number],
): Product {
  return { ...product, variants: product.variants.map(update) };
}

function mountPdp(product: Product, query: string) {
  setRoute(`/products/${product.handle}`, query);
  return render(<ProductDetail product={product} fieldRecord={null} />);
}

function optionRowFor(label: string): HTMLElement {
  return screen.getByRole("group", { name: label });
}

describe("selected variant truth", () => {
  it("honours the exact colorway and size named by the URL", () => {
    mountPdp(SHELL, "colorway=claystone&size=L");

    assert.ok(
      screen.getByRole("heading", { level: 1, name: SHELL.title }),
      "the PDP names the product",
    );
    assert.ok(
      screen.getByRole("link", {
        name: "Claystone / Charcoal colorway (selected)",
      }),
    );
    const sizes = optionRowFor("Size");
    assert.equal(
      within(sizes)
        .getByRole("link", { name: "L" })
        .getAttribute("aria-current"),
      "true",
    );
  });

  it("owns its own URL and rewrites an incomplete selection to the canonical one", () => {
    mountPdp(SHELL, "colorway=claystone");

    assert.deepEqual(currentRoute().replaced, [
      "/products/weatherline-shell?colorway=claystone&size=XS",
    ]);
  });

  it("keeps unrelated query state while replacing selection state", async () => {
    const user = userEvent.setup();
    mountPdp(SHELL, "utm_source=field&colorway=charcoal&size=XS");

    const sizes = optionRowFor("Size");
    assert.equal(
      within(sizes).getByRole("link", { name: "M" }).getAttribute("href"),
      "/products/weatherline-shell?utm_source=field&colorway=charcoal&size=M",
    );
    await user.click(within(sizes).getByRole("link", { name: "M" }));
  });

  it("prices the selected variant, not the product", () => {
    const priced = withVariants(SHELL, (variant, index) =>
      index === 3 ? { ...variant, price: USD(199.5) } : variant,
    );

    const regular = mountPdp(priced, "colorway=charcoal&size=XS");
    assert.match(
      visibleText(regular.container),
      new RegExp(`Price ${money(248)}`),
    );
    regular.unmount();

    mountPdp(priced, "colorway=charcoal&size=L");
    assert.match(
      visibleText(document.body),
      new RegExp(`Price ${money(199.5)}`),
    );
  });
});

describe("sale semantics", () => {
  it("strikes a genuinely higher compare-at with semantic markup", () => {
    const onSale = withVariants(SHELL, (variant, index) =>
      index === 3
        ? { ...variant, price: USD(199.5), compareAtPrice: USD(248) }
        : variant,
    );
    const { container } = mountPdp(onSale, "colorway=charcoal&size=L");

    const struck = container.querySelector("del");
    assert.ok(struck !== null, "a real sale needs a semantic del");
    assert.match(
      visibleText(struck),
      new RegExp(`Regular price ${money(248)}`),
    );
    assert.match(
      visibleText(container),
      new RegExp(`Sale price ${money(199.5)}`),
    );
    assert.match(visibleText(container), /On sale/);
    /* Percent-off and savings claims need data this contract does not carry. */
    assert.doesNotMatch(visibleText(container), /% off|Save \$|You save/i);
  });

  it("shows no sale treatment when compare-at is absent or not a discount", () => {
    for (const compareAtPrice of [null, USD(248), USD(199)]) {
      const product = withVariants(SHELL, (variant) => ({
        ...variant,
        compareAtPrice,
      }));
      const view = mountPdp(product, "colorway=charcoal&size=XS");

      assert.equal(view.container.querySelector("del"), null);
      assert.doesNotMatch(visibleText(view.container), /On sale|Regular price/);
      assert.match(
        visibleText(view.container),
        new RegExp(`Price ${money(248)}`),
      );
      view.unmount();
    }
  });
});

describe("sold-out truth", () => {
  it("keeps a deep-linked sold-out variant selected and says so", () => {
    const product = withVariants(SHELL, (variant, index) =>
      index === 3 ? { ...variant, availableForSale: false } : variant,
    );
    mountPdp(product, "colorway=charcoal&size=L");

    const sizes = optionRowFor("Size");
    const soldOut = within(sizes).getByTitle("L is unavailable");
    assert.equal(soldOut.getAttribute("aria-disabled"), "true");
    assert.equal(soldOut.getAttribute("aria-current"), "true");
    assert.equal(soldOut.tagName, "SPAN", "an unbuyable value is not a link");
    assert.match(visibleText(soldOut), /L \(sold out\)/);
    assert.equal(
      screen
        .getByRole("button", { name: /^Sold out/ })
        .hasAttribute("disabled"),
      true,
    );
  });

  it("marks a fully sold-out colorway while keeping it a working deep link", () => {
    const product = withVariants(SHELL, (variant) =>
      variant.colorwayId === "claystone"
        ? { ...variant, availableForSale: false }
        : variant,
    );
    mountPdp(product, "colorway=charcoal&size=XS");

    const link = screen.getByRole("link", {
      name: "Claystone / Charcoal colorway (sold out)",
    });
    assert.match(link.getAttribute("href") ?? "", /colorway=claystone/);
  });

  it("labels every buyable option value readably", () => {
    mountPdp(SHELL, "colorway=charcoal&size=XS");

    const sizes = optionRowFor("Size");
    assert.deepEqual(
      within(sizes)
        .getAllByRole("link")
        .map((link) => visibleText(link)),
      ["XS", "S", "M", "L", "XL"],
    );
    for (const colorway of SHELL.colorways) {
      assert.ok(
        screen.getByRole("link", {
          name: new RegExp(`^${colorway.name} colorway`),
        }),
      );
    }
  });
});

describe("gallery", () => {
  it("exposes every media as a named zoom control with a full-width hint on 1 and 4+", () => {
    const { container } = mountPdp(SHELL, "colorway=charcoal&size=XS");
    const gallery = screen.getByRole("region", {
      name: `${SHELL.title} gallery`,
    });
    const buttons = within(gallery).getAllByRole("button");

    assert.equal(buttons.length, 4);
    const colorway = SHELL.colorways[0];
    assert.ok(colorway !== undefined);
    const expected = [
      colorway.images.primary,
      colorway.images.alternate,
      colorway.images.detail,
      colorway.images.context,
    ];
    buttons.forEach((button, index) => {
      const image = expected[index];
      assert.ok(image !== undefined);
      assert.equal(
        button.getAttribute("aria-label"),
        `Zoom image ${index + 1}: ${image.alt}`,
      );
      const rendered = within(button).getByRole("img");
      assert.equal(rendered.getAttribute("src"), image.src);
      assert.equal(rendered.getAttribute("alt"), image.alt);
      assert.equal(
        rendered.getAttribute("sizes"),
        index === 0 || index >= 3 ? "(min-width: 820px) 55vw, 100vw" : "40vw",
      );
    });
    assert.equal(container.querySelectorAll("dialog").length, 0);
  });

  it("opens a named modal, steps through media, and restores the trigger", async () => {
    const user = userEvent.setup();
    mountPdp(SHELL, "colorway=charcoal&size=XS");
    const gallery = screen.getByRole("region", {
      name: `${SHELL.title} gallery`,
    });
    const trigger = within(gallery).getAllByRole("button")[1];
    assert.ok(trigger !== undefined);

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: `${SHELL.title} image gallery`,
    });
    assert.match(visibleText(dialog), /02 \/ 04/);

    await user.click(
      within(dialog).getByRole("button", { name: "Next image" }),
    );
    assert.match(visibleText(dialog), /03 \/ 04/);
    await user.click(
      within(dialog).getByRole("button", { name: "Previous image" }),
    );
    assert.match(visibleText(dialog), /02 \/ 04/);

    await user.keyboard("{Escape}");
    assert.equal(
      screen.queryByRole("dialog", { name: `${SHELL.title} image gallery` }),
      null,
    );
  });
});

describe("add to cart identity", () => {
  it("adds the exact selected variant with its colorway, size, and deep link", async () => {
    const user = userEvent.setup();
    mountPdp(SHELL, "colorway=claystone&size=L");

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: /^Add to cart/ }));

    assert.deepEqual(
      getCartSnapshot().map((line) => ({
        variantId: line.variantId,
        productHandle: line.productHandle,
        colorwayId: line.colorwayId,
        selectedOptions: line.selectedOptions,
        quantity: line.quantity,
        href: line.href,
      })),
      [
        {
          variantId: "demo:weatherline-shell:claystone:L",
          productHandle: "weatherline-shell",
          colorwayId: "claystone",
          selectedOptions: { Size: "L" },
          quantity: 2,
          href: "/products/weatherline-shell?colorway=claystone&size=L",
        },
      ],
    );
    assert.match(
      visibleText(screen.getByRole("button", { name: /^Add to cart/ })),
      new RegExp(`Add to cart · ${money(496)}`),
    );
  });

  it("says Sold out instead of disabling the price contract silently", () => {
    const product = withVariants(SHELL, (variant) => ({
      ...variant,
      availableForSale: false,
    }));
    mountPdp(product, "colorway=charcoal&size=XS");

    const atc = screen.getByRole("button", { name: /^Sold out/ });
    assert.equal(atc.hasAttribute("disabled"), true);
    assert.match(visibleText(atc), new RegExp(`Sold out · ${money(248)}`));
    assert.equal(getCartSnapshot().length, 0);
  });
});
