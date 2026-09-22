/**
 * Normalized storefront view models.
 *
 * These are the only shapes routes and visual components may consume. Raw
 * static fixture records live in `src/lib/storefront/fixtures/` and are read
 * exclusively through the data source in `src/lib/storefront/data-source.ts`,
 * so a later Shopify adapter can replace one domain at a time without
 * rewriting page composition.
 */

export interface Money {
  amount: number;
  currencyCode: "USD";
}

export interface StorefrontImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Approved image roles for a product colorway, in display order. */
export interface ColorwayImages {
  primary: StorefrontImage;
  alternate: StorefrontImage;
  detail: StorefrontImage;
  context: StorefrontImage;
}

export interface ProductColorway {
  id: string;
  name: string;
  /**
   * Shopify's own swatch colour when the merchant set one, otherwise `null`.
   * Most stores set none, so selectors fall back to the colorway image.
   */
  swatchColor: string | null;
  images: ColorwayImages;
}

export interface ProductOption {
  name: string;
  values: readonly string[];
}

export interface ProductVariant {
  /** Exact Shopify merchandise GID in live mode; deterministic demo id in static mode. */
  id: string;
  colorwayId: string;
  /** Every selected option except Color, in Shopify option order. */
  selectedOptions: readonly {
    name: string;
    value: string;
  }[];
  price: Money;
  /**
   * Shopify's compare-at money when the merchant set one, otherwise `null`.
   * It is not a sale by itself — see `saleCompareAtPrice` in `product-state`.
   */
  compareAtPrice: Money | null;
  availableForSale: boolean;
}

export interface SpecRow {
  label: string;
  value: string;
}

/**
 * The store's own product type, verbatim. It is a label the merchant controls,
 * not a taxonomy the theme declares, so it is an open string.
 */
export type ProductCategory = string;

export interface Product {
  handle: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  activities: readonly string[];
  price: Money;
  description: string;
  detailParagraphs: readonly string[];
  specs: readonly SpecRow[];
  care: readonly string[];
  repair: string;
  colorways: readonly ProductColorway[];
  options: readonly ProductOption[];
  variants: readonly ProductVariant[];
  relatedHandles: readonly string[];
}

export interface Collection {
  handle: string;
  title: string;
  /**
   * Short field-report style code from the `forward.field_code` metafield.
   * Empty when the store sets none; the hero then omits the eyebrow code.
   */
  fieldCode: string;
  /** The store's own description; empty when the merchant wrote none. */
  description: string;
  /** The collection image, or `null` when the store has not set one. */
  heroImage: StorefrontImage | null;
  productHandles: readonly string[];
}

export type ArticleBlock =
  | { type: "paragraph"; text: string; runs: RichTextParagraph }
  | { type: "heading"; text: string; runs: RichTextParagraph }
  | { type: "pullquote"; text: string; runs: RichTextParagraph }
  | { type: "note"; label: string; text: string }
  | { type: "image"; image: StorefrontImage; caption: string };

export interface JournalArticle {
  handle: string;
  title: string;
  excerpt: string;
  /** Editorial plate number, e.g. "No. 04". */
  plate: string;
  publishedAt: string;
  readingMinutes: number;
  location: string;
  coordinates: string;
  heroImage: StorefrontImage;
  body: readonly ArticleBlock[];
}

export interface PageSection {
  heading: string;
  paragraphs: readonly RichTextParagraph[];
}

export interface StorePage {
  handle: string;
  title: string;
  eyebrow: string;
  intro: string;
  heroImage?: StorefrontImage;
  sections: readonly PageSection[];
}

export interface PolicySection {
  heading: string;
  paragraphs: readonly RichTextParagraph[];
}

export interface RichTextRun {
  text: string;
  href?: string;
}

export type RichTextParagraph = readonly RichTextRun[];

export interface Policy {
  handle: string;
  title: string;
  updatedAt?: string;
  summary: string;
  sections: readonly PolicySection[];
}

export interface NavItem {
  href: string;
  label: string;
  children?: readonly NavItem[];
}

export interface FooterColumn {
  heading: string;
  links: readonly NavItem[];
}

export interface SiteNavigation {
  primary: readonly NavItem[];
  utility: readonly NavItem[];
  footerColumns: readonly FooterColumn[];
}

export interface ThemeContent {
  announcement: string;
  footerTagline: string;
  demoNotice: string;
  footerStatus: string;
  homeHeroImage: StorefrontImage;
  standardBandImage: StorefrontImage;
}

/** Seed line for the client-side demo cart (no persistence, no network). */
export interface DemoCartSeedLine {
  productHandle: string;
  colorwayId: string;
  size?: string;
  quantity: number;
}

export interface ProductListFilter {
  category?: ProductCategory;
  activity?: string;
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";
