import STATIC_CONTENT from "@/translations/en.json" with { type: "json" };
import type { Translate } from "./translate";

/**
 * Forward's own copy, in English: every string the theme renders that the
 * merchant did not author.
 *
 * `src/translations/en.json` is `themeSchema.i18n.staticContent`, the source
 * Studio's Translation Manager lists and translates per market. Merchant-
 * authored section settings and Shopify content are not here: Weaverse and
 * Shopify localize those themselves. Other languages layer over it through
 * `themeContent()` in `./theme-content`.
 *
 * `TranslationKey` is derived from the JSON, so a renamed or removed key
 * breaks its callers at compile time. `{{name}}` marks an interpolated value.
 */
export { STATIC_CONTENT };

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DotPaths<typeof STATIC_CONTENT>;

/** `t` over the theme's own keys. */
export type ThemeTranslate = Translate<TranslationKey>;
