import type { Translate } from "./translate";

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
    columnLinks: "{{heading}} links",
    fieldGuide: "Field guide",
    fieldGuideLinks: "Forward field guide links",
    fieldGuidePages: {
      about: "Inside Forward",
      materials: "Material library",
      fieldTesting: "Field testing",
    },
    social: "Weaverse community",
    fieldOffice: "FORWARD · Field office 54.4609° N / 3.0886° W",
    paymentMethods: "Accepted payment methods",
  },
  header: {
    stack: "Shopify · Hydrogen · Next.js · Weaverse",
    announcementLabel: "Store announcement",
    primaryNavigation: "Primary navigation",
    search: "Search",
    account: "Account",
    signedIn: "Signed in",
    cart: "Cart",
    menu: "Menu",
    shopIndexLabel: "Shop field index",
    shopIndexHeading: "Shop / Field index",
    systemCount: "{{count}} systems",
    shopCollections: "Shop collections",
    aboutLabel: "About Forward pages",
    aboutHeading: "About / Field manual",
    aboutNavigation: "About Forward",
    overview: "Overview",
    pageCount: "{{count}} pages",
    mobileMenu: "Site menu",
    closeMenu: "Close menu",
    mobileNavigation: "Mobile primary navigation",
    mobileCollections: "Mobile shop collections",
    mobileTagline: "Designed for weather, miles, and repeat use.",
    mobileRailTitle: "FOR / WARD · Field index",
    mobileRailCaption: "Shopify menu structure · Forward field system",
    cartCountOne: "{{count}} item in cart",
    cartCountOther: "{{count}} items in cart",
  },
  cart: {
    fallbackTitle: "Forward gear",
    addToCart: "Add to cart",
    soldOut: "Sold out",
    adding: "Adding…",
    updating: "Updating your cart…",
    secureNote:
      "Secure Shopify cart. Checkout is handed off to Shopify; no payment runs on this page.",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    quantity: "Quantity",
    decreaseLine: "Decrease quantity of {{title}}",
    increaseLine: "Increase quantity of {{title}}",
    remove: "Remove",
    removeLine: "{{title}} from cart",
    eyebrow: "Your field bag · live Shopify cart",
    headingOne: "Cart · {{count}} item",
    headingOther: "Cart · {{count}} items",
    items: "Cart items",
    summary: "Order summary",
    subtotal: "Subtotal",
    delivery: "Delivery",
    deliveryNote: "Calculated by Shopify at checkout",
    total: "Total",
    checkout: "Checkout",
    checkoutSecure: "Checkout securely with Shopify",
    checkoutUnavailable: "Checkout unavailable",
    handoffNote:
      "Checkout is a validated handoff to Shopify. Forward does not collect payment details on this page.",
    emptyHeading: "Nothing packed yet.",
    emptyCopy: "Build a field system around the weather and miles ahead.",
    emptyCta: "Explore all gear",
    metaTitle: "Cart",
    metaDescription: "Your Forward cart.",
    updated: "Your cart was updated.",
    quantityShort: "Qty {{quantity}}",
    viewCart: "View cart",
    added: "Added to cart",
    addedAnnouncement: "Added to cart.",
    addedAgainAnnouncement: "Item added to cart.",
    previewLabel: "Cart updated",
    closePreview: "Close cart preview",
  },
  market: {
    change: "Change shipping market",
    heading: "Shipping market",
  },
} as const;

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DotPaths<typeof STATIC_CONTENT>;

/** `t` over the theme's own keys. */
export type ThemeTranslate = Translate<TranslationKey>;
