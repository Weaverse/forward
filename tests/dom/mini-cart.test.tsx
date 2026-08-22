/**
 * Mini-cart lifecycle.
 *
 * The panel is driven end to end: a real add-to-cart control writes the real
 * browser-local cart and announces the add, and the mini-cart reads that cart
 * back. Timers are faked so the dismissal contract is asserted exactly rather
 * than waited out.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, jest } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddToCartForm } from "@/components/add-to-cart-form";
import { MiniCart } from "@/components/mini-cart";
import { addCartLine } from "@/lib/demo-cart/store";
import { formatMoney } from "@/lib/storefront/format";
import { resolveProductSelection } from "@/lib/storefront/product-state";
import { productByHandle, visibleText } from "./harness";

const AUTO_DISMISS_MS = 8000;
const PRODUCT = productByHandle("weatherline-shell");
const SELECTION = resolveProductSelection(PRODUCT, "charcoal", { Size: "M" });

/**
 * The mini-cart and the add control mount separately so each surface can be
 * queried on its own; both carry a polite `status` region of their own.
 */
let miniCartRoot: HTMLElement;

function setup() {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
    delay: null,
  });
  miniCartRoot = render(<MiniCart />).container;
  render(<AddToCartForm product={PRODUCT} selection={SELECTION} />);
  return { user };
}

function panel(): HTMLElement | null {
  return screen.queryByRole("dialog", { name: "Cart updated" });
}

function status(): string {
  return visibleText(within(miniCartRoot).getByRole("status"));
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("mini-cart open signal", () => {
  it("stays closed until an add is explicitly announced", () => {
    setup();
    assert.equal(panel(), null);

    /* A cart write on its own — a quantity edit elsewhere — must not open it. */
    act(() => {
      addCartLine({
        key: "weatherline-shell::demo:weatherline-shell:charcoal:M",
        variantId: SELECTION.variant.id,
        productHandle: PRODUCT.handle,
        title: PRODUCT.title,
        colorwayId: "charcoal",
        colorwayName: SELECTION.colorway.name,
        selectedOptions: { Size: "M" },
        quantity: 1,
        unitPrice: SELECTION.variant.price,
        image: SELECTION.colorway.images.primary,
        href: `/products/${PRODUCT.handle}`,
      });
    });

    assert.equal(panel(), null);
  });

  it("opens on a successful add showing the exact line it added", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /^Add to cart/ }));

    const open = panel();
    assert.ok(open !== null);
    assert.equal(open.getAttribute("aria-modal"), null);
    assert.match(visibleText(open), /^Added to cart/);
    assert.ok(
      within(open).getByRole("link", { name: PRODUCT.title }),
      "the panel names the exact product added",
    );
    assert.match(
      visibleText(open),
      new RegExp(`${SELECTION.colorway.name} · M`),
    );
    assert.match(visibleText(open), /Qty 1/);
    assert.match(
      visibleText(open),
      new RegExp(formatMoney(SELECTION.variant.price).replace("$", "\\$")),
    );
    assert.equal(
      within(open)
        .getByRole("link", { name: "View cart" })
        .getAttribute("href"),
      "/cart",
    );
    /* Static mode has no Shopify checkout handoff to advertise. */
    assert.equal(within(open).queryByRole("link", { name: "Checkout" }), null);
    assert.equal(status(), "Added to cart.");
  });

  it("never steals focus from the control the shopper used", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: /^Add to cart/ });

    await user.click(add);
    assert.ok(panel() !== null);
    assert.equal(document.activeElement, add);
  });
});

describe("mini-cart repeated adds", () => {
  it("restarts the lifecycle and re-announces an identical repeat add", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: /^Add to cart/ });

    await user.click(add);
    assert.match(visibleText(panel()), /Qty 1/);
    assert.equal(status(), "Added to cart.");

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS - 2000);
    });
    assert.ok(panel() !== null);

    /* Keyboard activation repeats the add without an outside pointer, so the
     * panel stays mounted and has to refresh itself in place. */
    add.focus();
    await user.keyboard("{Enter}");
    assert.match(visibleText(panel()), /Qty 2/);
    assert.equal(
      status(),
      "Item added to cart.",
      "an identical repeat add still needs a fresh live-region update",
    );
    assert.equal(
      screen.getAllByRole("dialog", { name: "Cart updated" }).length,
      1,
      "repeated adds must never stack a second mini-cart",
    );

    /* The dismissal timer restarted from the repeat add. */
    act(() => {
      jest.advanceTimersByTime(2001);
    });
    assert.ok(panel() !== null);

    await user.keyboard("{Enter}");
    assert.equal(status(), "Added to cart.");
    assert.match(visibleText(panel()), /Qty 3/);
  });

  it("closes and reopens when the shopper re-adds with a pointer", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: /^Add to cart/ });

    await user.click(add);
    assert.match(visibleText(panel()), /Qty 1/);

    /* The pointer lands outside the panel, which dismisses it, and the add
     * that follows opens a fresh panel reporting the merged line. */
    await user.click(add);
    assert.match(visibleText(panel()), /Qty 2/);
    assert.equal(
      screen.getAllByRole("dialog", { name: "Cart updated" }).length,
      1,
    );
  });
});

describe("mini-cart dismissal", () => {
  it("auto-dismisses once its timer elapses", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /^Add to cart/ }));

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS - 2000);
    });
    assert.ok(panel() !== null, "the panel must not vanish before its window");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    assert.equal(panel(), null);
    assert.equal(status(), "");
  });

  it("pauses auto-dismissal while focus is inside and resumes when it leaves", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: /^Add to cart/ });
    await user.click(add);

    const open = panel();
    assert.ok(open !== null);
    const viewCart = within(open).getByRole("link", { name: "View cart" });
    viewCart.focus();

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS * 3);
    });
    assert.ok(panel() !== null, "focus inside the panel must hold it open");

    act(() => {
      add.focus();
    });
    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS);
    });
    assert.equal(panel(), null);
  });

  it("dismisses on Escape and on an outside pointer", async () => {
    const { user } = setup();
    const add = screen.getByRole("button", { name: /^Add to cart/ });

    await user.click(add);
    await user.keyboard("{Escape}");
    assert.equal(panel(), null);

    await user.click(add);
    assert.ok(panel() !== null);
    await user.click(document.body);
    assert.equal(panel(), null);
  });

  it("dismisses from its own close control", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /^Add to cart/ }));

    await user.click(
      screen.getByRole("button", { name: "Close cart preview" }),
    );
    assert.equal(panel(), null);
    assert.equal(status(), "");
  });
});
