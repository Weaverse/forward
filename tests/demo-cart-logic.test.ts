import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addLine,
  type DemoCartLine,
  FREE_SHIPPING_THRESHOLD,
  lineKey,
  MAX_LINE_QUANTITY,
  removeLine,
  sanitizeLines,
  setLineQuantity,
  shipping,
  subtotal,
  total,
  totalQuantity,
} from "../src/lib/demo-cart/cart-logic.ts";

function makeLine(overrides: Partial<DemoCartLine> = {}): DemoCartLine {
  return {
    key: lineKey("weatherline-shell", "charcoal", "M"),
    productHandle: "weatherline-shell",
    title: "Weatherline Shell",
    colorwayId: "charcoal",
    colorwayName: "Charcoal",
    size: "M",
    quantity: 1,
    unitPrice: { amount: 100, currencyCode: "USD" },
    image: { src: "/images/x.webp", alt: "x", width: 800, height: 1000 },
    href: "/products/weatherline-shell",
    ...overrides,
  };
}

describe("lineKey", () => {
  it("is stable per product + colorway + size", () => {
    assert.equal(lineKey("a", "b", "M"), lineKey("a", "b", "M"));
    assert.notEqual(lineKey("a", "b", "M"), lineKey("a", "b", "L"));
    assert.notEqual(lineKey("a", "b"), lineKey("a", "c"));
  });
});

describe("addLine", () => {
  it("appends a new line", () => {
    const lines = addLine([], makeLine());
    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.quantity, 1);
  });

  it("merges quantities for the same key", () => {
    const lines = addLine(
      [makeLine({ quantity: 2 })],
      makeLine({ quantity: 3 }),
    );
    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.quantity, 5);
  });

  it("clamps merged quantities to the line maximum", () => {
    const lines = addLine(
      [makeLine({ quantity: MAX_LINE_QUANTITY })],
      makeLine({ quantity: 5 }),
    );
    assert.equal(lines[0]?.quantity, MAX_LINE_QUANTITY);
  });

  it("keeps different sizes as separate lines", () => {
    const lines = addLine(
      [makeLine()],
      makeLine({
        key: lineKey("weatherline-shell", "charcoal", "L"),
        size: "L",
      }),
    );
    assert.equal(lines.length, 2);
  });
});

describe("setLineQuantity", () => {
  it("sets a clamped quantity", () => {
    const lines = setLineQuantity([makeLine()], makeLine().key, 99);
    assert.equal(lines[0]?.quantity, MAX_LINE_QUANTITY);
  });

  it("removes the line when quantity drops below one", () => {
    const lines = setLineQuantity([makeLine()], makeLine().key, 0);
    assert.equal(lines.length, 0);
  });

  it("leaves other lines untouched", () => {
    const other = makeLine({ key: lineKey("ridge-30", "dune") });
    const lines = setLineQuantity([makeLine(), other], makeLine().key, 4);
    assert.equal(lines.length, 2);
    assert.equal(lines[1]?.quantity, 1);
  });
});

describe("removeLine", () => {
  it("removes only the addressed line", () => {
    const other = makeLine({ key: lineKey("ridge-30", "dune") });
    const lines = removeLine([makeLine(), other], makeLine().key);
    assert.deepEqual(lines, [other]);
  });
});

describe("totals", () => {
  it("sums quantities and subtotal across lines", () => {
    const lines = [
      makeLine({ quantity: 2, unitPrice: { amount: 40, currencyCode: "USD" } }),
      makeLine({
        key: lineKey("ridge-30", "dune"),
        quantity: 1,
        unitPrice: { amount: 30, currencyCode: "USD" },
      }),
    ];
    assert.equal(totalQuantity(lines), 3);
    assert.equal(subtotal(lines).amount, 110);
  });

  it("charges flat shipping below the free-shipping threshold", () => {
    const lines = [
      makeLine({
        unitPrice: { amount: FREE_SHIPPING_THRESHOLD - 1, currencyCode: "USD" },
      }),
    ];
    assert.equal(shipping(lines).amount, 8);
    assert.equal(total(lines).amount, FREE_SHIPPING_THRESHOLD - 1 + 8);
  });

  it("ships free at the threshold and for empty carts", () => {
    const lines = [
      makeLine({
        unitPrice: { amount: FREE_SHIPPING_THRESHOLD, currencyCode: "USD" },
      }),
    ];
    assert.equal(shipping(lines).amount, 0);
    assert.equal(shipping([]).amount, 0);
    assert.equal(total([]).amount, 0);
  });
});

describe("sanitizeLines", () => {
  it("returns an empty cart for non-array values", () => {
    assert.deepEqual(sanitizeLines(undefined), []);
    assert.deepEqual(sanitizeLines(null), []);
    assert.deepEqual(sanitizeLines("nope"), []);
    assert.deepEqual(sanitizeLines({}), []);
  });

  it("drops malformed entries and keeps valid ones", () => {
    const valid = makeLine();
    const lines = sanitizeLines([
      valid,
      null,
      42,
      { key: "missing-everything" },
      { ...valid, key: lineKey("ridge-30", "dune"), quantity: "2" },
      { ...valid, key: lineKey("talus-trail", "limestone"), image: {} },
    ]);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.key, valid.key);
  });

  it("deduplicates keys and clamps revived quantities", () => {
    const valid = makeLine();
    const lines = sanitizeLines([
      { ...valid, quantity: 99.7 },
      { ...valid, quantity: 3 },
    ]);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.quantity, MAX_LINE_QUANTITY);
  });

  it("drops non-string sizes without dropping the line", () => {
    const valid = makeLine();
    const lines = sanitizeLines([{ ...valid, size: 42 }]);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.size, undefined);
  });
});
