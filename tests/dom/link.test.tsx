import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { screen } from "@testing-library/react";

import { Link } from "@/components/link";
import { renderWithCart } from "./harness";

describe("theme link", () => {
  it("keeps the default market out of the URL", () => {
    renderWithCart(<Link href="/shop">Shop</Link>);
    assert.equal(screen.getByRole("link").getAttribute("href"), "/shop");
  });

  it("prefixes the current market and leaves external links alone", () => {
    renderWithCart(
      <>
        <Link href="/shop?sort=name">Shop</Link>
        <Link href="https://example.com/x">Out</Link>
      </>,
      undefined,
      "de-de",
    );
    assert.equal(
      screen.getByRole("link", { name: "Shop" }).getAttribute("href"),
      "/de-de/shop?sort=name",
    );
    assert.equal(
      screen.getByRole("link", { name: "Out" }).getAttribute("href"),
      "https://example.com/x",
    );
  });

  it("links into another market when asked", () => {
    renderWithCart(
      <Link href="/cart" locale="ja-jp">
        Japan
      </Link>,
      undefined,
      "de-de",
    );
    assert.equal(screen.getByRole("link").getAttribute("href"), "/ja-jp/cart");
  });
});
