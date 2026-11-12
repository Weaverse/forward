import assert from "node:assert/strict";
import { getLocalePathSegment, getSupportedLocales } from "@shopify/hydrogen";
import { describe, it } from "vite-plus/test";

import { LOCALE_IDS, LOCALES } from "../src/lib/i18n/locales.ts";
import { SHOPIFY_I18N } from "../src/lib/i18n/shopify-i18n.ts";

describe("Shopify i18n definition", () => {
  it("derives the same URL segment Forward routes for every locale", () => {
    const segments =
      getSupportedLocales(SHOPIFY_I18N).map(getLocalePathSegment);

    assert.deepEqual(segments.sort(), [...LOCALE_IDS].sort());
  });

  it("serves the default locale unprefixed", () => {
    const { defaultLocale } = SHOPIFY_I18N;

    assert.equal(defaultLocale.country, LOCALES["en-us"].country);
    assert.equal(defaultLocale.language, LOCALES["en-us"].language);
  });
});
