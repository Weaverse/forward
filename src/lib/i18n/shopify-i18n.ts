/**
 * Forward's markets as Hydrogen's i18n definition, for server code that
 * creates Shopify request contexts. Kept apart from `locales.ts`, which client
 * components import and which must stay dependency-free.
 *
 * Hydrogen derives each prefix as `/{language}-{country}`, which is exactly
 * Forward's locale id, so no `pathSegment` overrides are needed.
 */

import { defineShopifyI18n } from "@shopify/hydrogen";

import { DEFAULT_LOCALE, LOCALE_IDS, localeI18n } from "./locales";

export const SHOPIFY_I18N = defineShopifyI18n({
  defaultLocale: localeI18n(DEFAULT_LOCALE),
  routing: {
    type: "pathname",
    locales: LOCALE_IDS.filter((id) => id !== DEFAULT_LOCALE).map(localeI18n),
  },
});
