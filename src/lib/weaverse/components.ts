/**
 * The Weaverse component registry.
 *
 * Each entry pairs a shipped component with the `schema` exported beside it,
 * so a component and the settings Builder shows for it are edited in one file
 * and cannot drift apart. The registry is the single list the SDK sees, which
 * is how the contract's theme-owned surfaces stay theme-owned: a component
 * that is not here cannot be composed.
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

import * as Button from "@/components/button";
import * as Heading from "@/components/heading";
import * as Paragraph from "@/components/paragraph";
import * as Subheading from "@/components/subheading";
import * as CollectionIndex from "@/sections/collection-index";
import * as EditorialCallout from "@/sections/editorial-callout";
import * as EditorialHero from "@/sections/editorial-hero";
import * as EditorialOverlayHero from "@/sections/editorial-overlay-hero";
import * as FeaturedProducts from "@/sections/featured-products";
import * as HomeHero from "@/sections/home-hero";
import * as KitCallout from "@/sections/kit-callout";
import * as MaterialStandard from "@/sections/material-standard";
import * as NumberedSequence from "@/sections/numbered-sequence";
import * as PrincipleGrid from "@/sections/principle-grid";
import * as ProductCaseStudy from "@/sections/product-case-study";
import * as ProductSpotlight from "@/sections/product-spotlight";
import * as ProductStrip from "@/sections/product-strip";
import * as ProductTiles from "@/sections/product-tiles";
import * as RepairAndJournal from "@/sections/repair-and-journal";
import * as StandardStatement from "@/sections/standard-statement";
import * as StatBand from "@/sections/stat-band";

type SchemaModule = { schema: WeaverseNextComponent["schema"] };

/**
 * Pairs a module's exported component with the schema exported beside it.
 *
 * Sections keep named exports per `AGENTS.md`, so the component is named
 * rather than a module default. The SDK renders registry entries with its own
 * prop shape; that cast is confined here so no section has to loosen its own
 * types, and mapping settings onto props stays the composition slice's job.
 */
function entry(
  module: SchemaModule,
  component: unknown,
): WeaverseNextComponent {
  return {
    default: component as WeaverseNextComponent["default"],
    schema: module.schema,
  };
}

export const WEAVERSE_COMPONENTS: WeaverseNextComponent[] = [
  /* Shared elements, usable inside any composed section. */
  entry(Heading, Heading.Heading),
  entry(Subheading, Subheading.Subheading),
  entry(Paragraph, Paragraph.Paragraph),
  entry(Button, Button.Button),

  /* INDEX */
  entry(HomeHero, HomeHero.HomeHero),
  entry(FeaturedProducts, FeaturedProducts.FeaturedProducts),
  entry(CollectionIndex, CollectionIndex.CollectionIndex),
  entry(ProductSpotlight, ProductSpotlight.ProductSpotlight),
  entry(MaterialStandard, MaterialStandard.MaterialStandard),
  entry(KitCallout, KitCallout.KitCallout),
  entry(RepairAndJournal, RepairAndJournal.RepairAndJournal),

  /* PAGE */
  entry(EditorialHero, EditorialHero.EditorialHero),
  entry(EditorialOverlayHero, EditorialOverlayHero.EditorialOverlayHero),
  entry(EditorialCallout, EditorialCallout.EditorialCallout),
  entry(StandardStatement, StandardStatement.StandardStatement),
  entry(StatBand, StatBand.StatBand),
  entry(ProductStrip, ProductStrip.ProductStrip),
  entry(PrincipleGrid, PrincipleGrid.PrincipleGrid),
  entry(ProductTiles, ProductTiles.ProductTiles),
  entry(NumberedSequence, NumberedSequence.NumberedSequence),
  entry(ProductCaseStudy, ProductCaseStudy.ProductCaseStudy),
];

/** Every registered type, for tests and the seed script. */
export const WEAVERSE_SECTION_TYPES: readonly string[] =
  WEAVERSE_COMPONENTS.map((component) => component.schema.type);
