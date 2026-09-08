/**
 * The Weaverse component registry.
 *
 * One entry per composable section, pairing the shipped presentation component
 * with its Builder schema. The registry is the single list the SDK sees, so a
 * section that is not here cannot be composed — which is exactly how the
 * contract's theme-owned surfaces stay theme-owned.
 *
 * Deliberately absent, and argued in the spec rather than forgotten:
 *
 * - Header, Footer, announcement bar, and mini-cart, which are configured
 *   through theme settings and never composed;
 * - the PDP buy block and its `colorway`/`size` query state;
 * - the collection and Shop grid behavior;
 * - Cart and `/account/**`;
 * - `index-header`, `journal-*`, `product-results`, `search-*`, and
 *   `policy-document`, which were extracted for code organization only and
 *   belong to theme-owned routes.
 */

import type { WeaverseNextComponent } from "@weaverse/next";

import { CollectionIndex } from "@/sections/collection-index";
import { EditorialCallout } from "@/sections/editorial-callout";
import { EditorialHero } from "@/sections/editorial-hero";
import { EditorialOverlayHero } from "@/sections/editorial-overlay-hero";
import { FeaturedProducts } from "@/sections/featured-products";
import { HomeHero } from "@/sections/home-hero";
import { KitCallout } from "@/sections/kit-callout";
import { MaterialStandard } from "@/sections/material-standard";
import { NumberedSequence } from "@/sections/numbered-sequence";
import { PrincipleGrid } from "@/sections/principle-grid";
import { ProductCaseStudy } from "@/sections/product-case-study";
import { ProductSpotlight } from "@/sections/product-spotlight";
import { ProductStrip } from "@/sections/product-strip";
import { ProductTiles } from "@/sections/product-tiles";
import { RepairAndJournal } from "@/sections/repair-and-journal";
import { StandardStatement } from "@/sections/standard-statement";
import { StatBand } from "@/sections/stat-band";

import {
  collectionIndexSchema,
  editorialCalloutSchema,
  editorialHeroSchema,
  editorialOverlayHeroSchema,
  featuredProductsSchema,
  homeHeroSchema,
  kitCalloutSchema,
  materialStandardSchema,
  numberedSequenceSchema,
  principleGridSchema,
  productCaseStudySchema,
  productSpotlightSchema,
  productStripSchema,
  productTilesSchema,
  repairAndJournalSchema,
  standardStatementSchema,
  statBandSchema,
} from "./schemas";

/*
 * The section components take exact typed props; the SDK renders registry
 * entries with its own prop shape. The cast is confined to this list so no
 * `any` leaks into a section, and the mapping from settings to props is the
 * composition slice's job, not the registry's.
 */
function entry(
  component: unknown,
  schema: WeaverseNextComponent["schema"],
): WeaverseNextComponent {
  return {
    default: component as WeaverseNextComponent["default"],
    schema,
  };
}

export const WEAVERSE_COMPONENTS: WeaverseNextComponent[] = [
  /* INDEX */
  entry(HomeHero, homeHeroSchema),
  entry(FeaturedProducts, featuredProductsSchema),
  entry(CollectionIndex, collectionIndexSchema),
  entry(ProductSpotlight, productSpotlightSchema),
  entry(MaterialStandard, materialStandardSchema),
  entry(KitCallout, kitCalloutSchema),
  entry(RepairAndJournal, repairAndJournalSchema),

  /* PAGE */
  entry(EditorialHero, editorialHeroSchema),
  entry(EditorialOverlayHero, editorialOverlayHeroSchema),
  entry(EditorialCallout, editorialCalloutSchema),
  entry(StandardStatement, standardStatementSchema),
  entry(StatBand, statBandSchema),
  entry(ProductStrip, productStripSchema),
  entry(PrincipleGrid, principleGridSchema),
  entry(ProductTiles, productTilesSchema),
  entry(NumberedSequence, numberedSequenceSchema),
  entry(ProductCaseStudy, productCaseStudySchema),
];

/** Every registered section type, for tests and the seed script. */
export const WEAVERSE_SECTION_TYPES: readonly string[] =
  WEAVERSE_COMPONENTS.map((component) => component.schema.type);
