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
  /** Solid swatch color rendered by PLP/PDP colorway selectors. */
  swatchColor: string;
  images: ColorwayImages;
}

export interface ProductOption {
  name: string;
  values: readonly string[];
}

export interface SpecRow {
  label: string;
  value: string;
}

export type ProductCategory = "shells" | "packs" | "footwear";

export interface Product {
  handle: string;
  title: string;
  subtitle: string;
  /** Field-plate number used by the editorial framing, e.g. "01". */
  plate: string;
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
  relatedHandles: readonly string[];
}

export interface Collection {
  handle: string;
  title: string;
  /** Short field-report style code, e.g. "FG-01". */
  fieldCode: string;
  description: string;
  heroImage: StorefrontImage;
  productHandles: readonly string[];
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "pullquote"; text: string }
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
  paragraphs: readonly string[];
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
  paragraphs: readonly string[];
}

export interface Policy {
  handle: string;
  title: string;
  updatedAt: string;
  summary: string;
  sections: readonly PolicySection[];
}

export interface NavItem {
  href: string;
  label: string;
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
  homeHeroImage: StorefrontImage;
  standardBandImage: StorefrontImage;
}

export type DemoOrderStatus = "delivered" | "in-transit" | "processing";

export interface DemoOrderLine {
  productHandle: string;
  title: string;
  colorwayId: string;
  colorwayName: string;
  size?: string;
  quantity: number;
  unitPrice: Money;
  image: StorefrontImage;
}

export interface DemoOrder {
  id: string;
  number: string;
  placedAt: string;
  status: DemoOrderStatus;
  statusDetail: string;
  lines: readonly DemoOrderLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
}

export interface DemoAddress {
  id: string;
  label: string;
  isDefault: boolean;
  name: string;
  lines: readonly string[];
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
