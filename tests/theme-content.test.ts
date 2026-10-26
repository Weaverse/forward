import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LOCALE_IDS } from "../src/lib/i18n/locales.ts";
import { STATIC_CONTENT } from "../src/lib/i18n/static-content.ts";
import { themeContent } from "../src/lib/i18n/theme-content.ts";
import { createTranslator } from "../src/lib/i18n/translate.ts";

const PLACEHOLDER = /\{\{\w+\}\}/g;

function leaves(tree: unknown, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") {
      out.set(path, value);
    } else {
      for (const entry of leaves(value, path)) {
        out.set(...entry);
      }
    }
  }
  return out;
}

describe("themeContent", () => {
  it("serves English markets the source copy unchanged", () => {
    assert.equal(themeContent("en-us"), STATIC_CONTENT);
    assert.equal(themeContent("en-gb"), STATIC_CONTENT);
  });

  it("layers a market's language over English, key by key", () => {
    const t = createTranslator({ staticContent: themeContent("de-de") });
    assert.equal(t("cart.addToCart"), "In den Warenkorb");
    // Not in the bundle: the English default survives the merge.
    assert.equal(t("footer.tagline"), STATIC_CONTENT.footer.tagline);
  });

  it("still lets a Studio translation win over the bundle", () => {
    const t = createTranslator({
      overrides: { cart: { addToCart: "Ab in den Rucksack" } },
      staticContent: themeContent("de-de"),
    });
    assert.equal(t("cart.addToCart"), "Ab in den Rucksack");
  });

  it("translates every English key with the same placeholders", () => {
    const english = leaves(STATIC_CONTENT);
    for (const locale of LOCALE_IDS) {
      const copy = leaves(themeContent(locale));
      assert.deepEqual([...copy.keys()].sort(), [...english.keys()].sort());
      for (const [key, text] of copy) {
        const source = english.get(key) ?? "";
        assert.deepEqual(
          (text.match(PLACEHOLDER) ?? []).sort(),
          (source.match(PLACEHOLDER) ?? []).sort(),
          `${locale} ${key}`,
        );
      }
    }
  });
});
