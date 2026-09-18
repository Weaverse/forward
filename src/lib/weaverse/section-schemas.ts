/**
 * Every section schema this theme registers, in the order Studio lists them.
 *
 * One list, so the two sides that need it cannot drift apart: the server
 * registry pairs each schema with its loader, and
 * `tests/weaverse-registry.test.ts` checks the client registry against it.
 *
 * Schemas only. A loader reaches the storefront data source through
 * `server-only`, so pairing them here would make this module unimportable from
 * tooling that runs outside Next, the test suite included.
 */

import type { SchemaType } from "@weaverse/schema";

import { schema as button } from "@/components/button/schema";
import { schema as buttons } from "@/components/buttons/schema";
import { schema as heading } from "@/components/heading/schema";
import { schema as main } from "@/components/main/schema";
import { schema as paragraph } from "@/components/paragraph/schema";
import { schema as sectionContent } from "@/components/section-content/schema";
import { schema as subheading } from "@/components/subheading/schema";
import { schema as articleBody } from "@/sections/article-body/schema";
import { schema as articleHeader } from "@/sections/article-header/schema";
import { schema as collectionGrid } from "@/sections/collection-grid/schema";
import { schema as collectionHero } from "@/sections/collection-hero/schema";
import { schema as collectionIndex } from "@/sections/collection-index/schema";
import { schema as editorialCallout } from "@/sections/editorial-callout/schema";
import { schema as editorialHero } from "@/sections/editorial-hero/schema";
import { schema as editorialOverlayHero } from "@/sections/editorial-overlay-hero/schema";
import { schema as featuredProducts } from "@/sections/featured-products/schema";
import { schema as fieldPractice } from "@/sections/field-practice/schema";
import { schema as heroSlideshow } from "@/sections/hero-slideshow/schema";
import { schema as heroSlide } from "@/sections/hero-slideshow/slide/schema";
import { schema as homeHero } from "@/sections/home-hero/schema";
import { schema as kitCallout } from "@/sections/kit-callout/schema";
import { schema as productBreadcrumb } from "@/sections/main-product/breadcrumb/schema";
import { schema as productBuyButtons } from "@/sections/main-product/buy-buttons/schema";
import { schema as productCollapsibleDetails } from "@/sections/main-product/collapsible-details/schema";
import { schema as productMedia } from "@/sections/main-product/media/schema";
import { schema as productMeta } from "@/sections/main-product/meta/schema";
import { schema as productPrices } from "@/sections/main-product/prices/schema";
import { schema as mainProduct } from "@/sections/main-product/schema";
import { schema as productSummary } from "@/sections/main-product/summary/schema";
import { schema as productTitle } from "@/sections/main-product/title/schema";
import { schema as productVariantSelector } from "@/sections/main-product/variant-selector/schema";
import { schema as materialStandard } from "@/sections/material-standard/schema";
import { schema as numberedSequence } from "@/sections/numbered-sequence/schema";
import { schema as pageHero } from "@/sections/page-hero/schema";
import { schema as pageOrigin } from "@/sections/page-origin/schema";
import { schema as pagePremise } from "@/sections/page-premise/schema";
import { schema as pageValues } from "@/sections/page-values/schema";
import { schema as principleGrid } from "@/sections/principle-grid/schema";
import { schema as productCaseStudy } from "@/sections/product-case-study/schema";
import { schema as productSpotlight } from "@/sections/product-spotlight/schema";
import { schema as productStrip } from "@/sections/product-strip/schema";
import { schema as productTiles } from "@/sections/product-tiles/schema";
import { schema as relatedProducts } from "@/sections/related-products/schema";
import { schema as repairAndJournal } from "@/sections/repair-and-journal/schema";
import { schema as standardStatement } from "@/sections/standard-statement/schema";
import { schema as statBand } from "@/sections/stat-band/schema";
import { schema as systemManifest } from "@/sections/system-manifest/schema";

export const SECTION_SCHEMAS: readonly SchemaType[] = [
  /* Page root. Overrides the SDK default so runtime props stay off the DOM. */
  main,

  /* Shared elements, usable inside any composed section. */
  heading,
  subheading,
  paragraph,
  button,
  buttons,
  sectionContent,

  /* INDEX */
  homeHero,
  heroSlideshow,
  heroSlide,
  featuredProducts,
  collectionIndex,
  productSpotlight,
  materialStandard,
  kitCallout,
  repairAndJournal,

  /* PRODUCT */
  mainProduct,
  productBreadcrumb,
  productMeta,
  productTitle,
  productPrices,
  productSummary,
  productVariantSelector,
  productBuyButtons,
  productCollapsibleDetails,
  productMedia,
  relatedProducts,

  /* COLLECTION */
  collectionHero,
  systemManifest,
  collectionGrid,
  fieldPractice,

  /* ARTICLE */
  articleHeader,
  articleBody,

  /* PAGE — Shopify pages and the three editorial routes. */
  pageHero,
  pagePremise,
  pageValues,
  pageOrigin,
  editorialHero,
  editorialOverlayHero,
  editorialCallout,
  standardStatement,
  statBand,
  productStrip,
  principleGrid,
  productTiles,
  numberedSequence,
  productCaseStudy,
];
