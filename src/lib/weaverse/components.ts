"use client";

/**
 * The client component registry — what Builder actually renders.
 *
 * `@weaverse/next`'s renderer is a Client Component (it holds context and
 * subscribes to a store), and a Client Component cannot import a Server
 * Component. So every composable section is a Client Component and lives here,
 * while `./server-components.ts` carries the same schemas plus the server-only
 * loaders. That split is forced by Next's RSC model, not by Weaverse: Pilot on
 * React Router needs only one registry because it has no such boundary.
 *
 * Deliberately absent, and argued in the spec rather than forgotten:
 *
 * - Header, Footer, announcement bar, and mini-cart, configured through theme
 *   settings and never composed.
 * - The Shop grid behavior, Cart, and `/account/**`. Collection browsing is
 *   composed, but its query state is resolved by the route.
 * - `index-header`, `journal-*`, `product-results`, `search-*`, and
 *   `policy-document`, extracted for code organization only.
 */

import type { WeaverseNextComponent } from "@weaverse/next";

import * as Button from "@/components/button";
import * as Buttons from "@/components/buttons";
import * as Heading from "@/components/heading";
import * as Main from "@/components/main";
import * as Paragraph from "@/components/paragraph";
import * as SectionContent from "@/components/section-content";
import * as Subheading from "@/components/subheading";
import * as ArticleBody from "@/sections/article-body";
import * as ArticleHeader from "@/sections/article-header";
import * as CollectionHero from "@/sections/collection-hero";
import * as CollectionIndex from "@/sections/collection-index";
import * as EditorialCallout from "@/sections/editorial-callout";
import * as EditorialHero from "@/sections/editorial-hero";
import * as EditorialOverlayHero from "@/sections/editorial-overlay-hero";
import * as FeaturedProducts from "@/sections/featured-products";
import * as FieldPractice from "@/sections/field-practice";
import * as HeroSlideshow from "@/sections/hero-slideshow";
import * as HeroSlide from "@/sections/hero-slideshow/slide";
import * as HomeHero from "@/sections/home-hero";
import * as KitCallout from "@/sections/kit-callout";
import * as MainCollection from "@/sections/main-collection";
import * as CollectionContent from "@/sections/main-collection/content";
import * as CollectionFilters from "@/sections/main-collection/filters";
import * as CollectionProductGrid from "@/sections/main-collection/product-grid";
import * as CollectionToolbar from "@/sections/main-collection/toolbar";
import * as MainProduct from "@/sections/main-product";
import * as ProductBreadcrumb from "@/sections/main-product/breadcrumb";
import * as ProductBuyButtons from "@/sections/main-product/buy-buttons";
import * as ProductCollapsibleDetails from "@/sections/main-product/collapsible-details";
import * as ProductInfo from "@/sections/main-product/info";
import * as ProductMedia from "@/sections/main-product/media";
import * as ProductMeta from "@/sections/main-product/meta";
import * as ProductPrices from "@/sections/main-product/prices";
import * as ProductSummary from "@/sections/main-product/summary";
import * as ProductTitle from "@/sections/main-product/title";
import * as ProductVariantSelector from "@/sections/main-product/variant-selector";
import * as MaterialStandard from "@/sections/material-standard";
import * as NumberedSequence from "@/sections/numbered-sequence";
import * as PageHero from "@/sections/page-hero";
import * as PageOrigin from "@/sections/page-origin";
import * as PagePremise from "@/sections/page-premise";
import * as PageValues from "@/sections/page-values";
import * as PrincipleGrid from "@/sections/principle-grid";
import * as ProductCaseStudy from "@/sections/product-case-study";
import * as ProductSpotlight from "@/sections/product-spotlight";
import * as ProductStrip from "@/sections/product-strip";
import * as ProductTiles from "@/sections/product-tiles";
import * as RelatedProducts from "@/sections/related-products";
import * as RepairAndJournal from "@/sections/repair-and-journal";
import * as StandardStatement from "@/sections/standard-statement";
import * as StatBand from "@/sections/stat-band";
import * as SystemManifest from "@/sections/system-manifest";

/**
 * A registry entry is the module itself: the component is its default export
 * and the schema sits beside it in the same file, so the two cannot be paired
 * up wrongly here.
 *
 * The renderer supplies its own prop shape, so the component type is widened
 * once at this boundary rather than loosening any section's own props.
 */
function entry(module: {
  default: unknown;
  schema: WeaverseNextComponent["schema"];
}): WeaverseNextComponent {
  return {
    default: module.default as WeaverseNextComponent["default"],
    schema: module.schema,
  };
}

export const WEAVERSE_COMPONENTS: WeaverseNextComponent[] = [
  /* Page root. Overrides the SDK default so runtime props stay off the DOM. */
  entry(Main),

  /* Shared elements, usable inside any composed section. */
  entry(Heading),
  entry(Subheading),
  entry(Paragraph),
  entry(Button),
  entry(Buttons),
  entry(SectionContent),

  /* INDEX */
  entry(HomeHero),
  entry(HeroSlideshow),
  entry(HeroSlide),
  entry(FeaturedProducts),
  entry(CollectionIndex),
  entry(ProductSpotlight),
  entry(MaterialStandard),
  entry(KitCallout),
  entry(RepairAndJournal),

  /* PRODUCT */
  entry(MainProduct),
  entry(ProductBreadcrumb),
  entry(ProductMeta),
  entry(ProductTitle),
  entry(ProductPrices),
  entry(ProductSummary),
  entry(ProductVariantSelector),
  entry(ProductBuyButtons),
  entry(ProductCollapsibleDetails),
  entry(ProductMedia),
  entry(ProductInfo),
  entry(RelatedProducts),

  /* COLLECTION */
  entry(CollectionHero),
  entry(SystemManifest),
  entry(MainCollection),
  entry(CollectionToolbar),
  entry(CollectionContent),
  entry(CollectionFilters),
  entry(CollectionProductGrid),
  entry(FieldPractice),

  /* ARTICLE */
  entry(ArticleHeader),
  entry(ArticleBody),

  /* PAGE — Shopify pages and the three editorial routes. */
  entry(PageHero),
  entry(PagePremise),
  entry(PageValues),
  entry(PageOrigin),
  entry(EditorialHero),
  entry(EditorialOverlayHero),
  entry(EditorialCallout),
  entry(StandardStatement),
  entry(StatBand),
  entry(ProductStrip),
  entry(PrincipleGrid),
  entry(ProductTiles),
  entry(NumberedSequence),
  entry(ProductCaseStudy),
];
