/**
 * Forward's Weaverse theme schema.
 *
 * The schema is composed from one file per setting group under `./settings/`,
 * so a group is edited in isolation and `./settings/types.ts` can derive the
 * `ThemeSettings` type straight from the same declarations.
 *
 * The contract makes Header and Footer settings-owned rather than
 * section-owned, which is why the global surfaces appear here as groups
 * instead of in the component registry.
 */

import type { WeaverseNextI18n, WeaverseNextThemeSchema } from "@weaverse/next";

import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
  type LocaleId,
  localePathPrefix,
  localeTag,
} from "@/lib/i18n/locales";
import { STATIC_CONTENT } from "@/lib/i18n/static-content";

import { editorialImagerySettings } from "./settings/editorial-imagery";
import { footerSettings } from "./settings/footer";
import { headerSettings } from "./settings/header";
import { layoutSettings } from "./settings/layout";

/** A market as Studio's market selector and Translation Manager read it. */
function shopLocale(locale: LocaleId): WeaverseNextI18n {
  const { country, currency, direction, label, language } = LOCALES[locale];
  return {
    pathPrefix: localePathPrefix(locale),
    label,
    language,
    country,
    currency,
    hreflang: localeTag(locale),
    direction,
  };
}

export const themeSchema: WeaverseNextThemeSchema = {
  info: {
    name: "Forward",
    version: "0.1.0",
  },
  settings: [
    layoutSettings,
    headerSettings,
    footerSettings,
    editorialImagerySettings,
  ],
  /* Derived from `LOCALES`, so a market is added in one place. `translation`
   * and `staticContent` are what Studio's Translation Manager reads. */
  i18n: {
    urlStructure: "url-path",
    defaultLocale: shopLocale(DEFAULT_LOCALE),
    shopLocales: LOCALE_IDS.map(shopLocale),
    translation: true,
    staticContent: STATIC_CONTENT,
  },
};

export type {
  EditorialImagerySettings,
  FooterSettings,
  HeaderSettings,
  ThemeSettings,
} from "./settings/types";
