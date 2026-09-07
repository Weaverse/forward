/**
 * Product card swatch behavior — the interactive contract the Phase 4
 * server/client boundary decision has to preserve. Target size is geometry and
 * is proved in `tests/browser/`.
 */

import assert from "node:assert/strict";
import { describe, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductCard } from "@/components/product-card";
import { productByHandle, visibleText } from "./harness";

const SHELL = productByHandle("weatherline-shell");

describe("product card", () => {
  it("names the product, price, and every colorway as real controls", () => {
    const { container } = render(<ProductCard product={SHELL} />);

    assert.ok(screen.getByRole("link", { name: `View ${SHELL.title}` }));
    assert.ok(screen.getByRole("heading", { level: 3, name: SHELL.title }));
    assert.equal(
      screen.getByRole("group", { name: `${SHELL.title} colorway` }).tagName,
      "FIELDSET",
    );
    assert.deepEqual(
      screen.getAllByRole("radio").map((radio) => radio.getAttribute("value")),
      SHELL.colorways.map((colorway) => colorway.id),
    );
    assert.match(
      visibleText(container),
      new RegExp(`${SHELL.colorways[0]?.name} · 02 colorways`),
    );
    const image = within(
      screen.getByRole("link", { name: `View ${SHELL.title}` }),
    ).getByRole("img");
    assert.equal(
      image.getAttribute("src"),
      SHELL.colorways[0]?.images.primary.src,
    );
    assert.equal(
      image.getAttribute("alt"),
      SHELL.colorways[0]?.images.primary.alt,
    );
  });

  it("retargets the card link and media when a colorway is selected", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={SHELL} />);
    const second = SHELL.colorways[1];
    assert.ok(second !== undefined);

    await user.click(
      screen.getByRole("radio", { name: `${second.name} colorway` }),
    );

    assert.equal(
      screen
        .getByRole("radio", { name: `${second.name} colorway` })
        .getAttribute("checked"),
      null,
    );
    assert.equal(
      (
        screen.getByRole("radio", {
          name: `${second.name} colorway`,
        }) as HTMLInputElement
      ).checked,
      true,
    );
    for (const link of screen.getAllByRole("link")) {
      assert.equal(
        link.getAttribute("href"),
        `/products/${SHELL.handle}?colorway=${second.id}`,
      );
    }
    assert.equal(
      within(screen.getByRole("link", { name: `View ${SHELL.title}` }))
        .getByRole("img")
        .getAttribute("src"),
      second.images.primary.src,
    );
  });

  it("keeps swatch selection keyboard operable", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={SHELL} />);
    const [first, second] = screen.getAllByRole("radio") as HTMLInputElement[];
    assert.ok(first !== undefined && second !== undefined);

    first.focus();
    await user.keyboard("{ArrowRight}");
    assert.equal(second.checked, true);
    assert.equal(document.activeElement, second);
  });
});
