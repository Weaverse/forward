/**
 * Forward's own copy, in English: every string the theme renders that the
 * merchant did not author.
 *
 * This object is `themeSchema.i18n.staticContent`, the source Studio's
 * Translation Manager lists and translates per market. Merchant-authored
 * section settings and Shopify content are not here: Weaverse and Shopify
 * localize those themselves.
 *
 * Keys are grouped by the surface that renders them. `TranslationKey` is
 * derived from this object, so a renamed or removed key breaks its callers at
 * compile time. `{{name}}` marks an interpolated value.
 */
export const STATIC_CONTENT = {
  announcement: {
    /** Empty by default: an unset announcement renders nothing. */
    text: "",
  },
  footer: {
    /** Empty by default: an unset tagline renders nothing. */
    tagline: "",
  },
} as const;

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DotPaths<typeof STATIC_CONTENT>;
