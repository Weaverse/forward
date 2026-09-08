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

/**
 * A registry entry is just the section module: the component is its default
 * export and the schema sits beside it in the same file, so the two cannot
 * drift apart or be paired up wrongly here.
 *
 * The SDK renders entries with its own prop shape, so the component type is
 * widened once at this boundary rather than loosening any section's own props.
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
  /* Shared elements, usable inside any composed section. */
  entry(Heading),
  entry(Subheading),
  entry(Paragraph),
  entry(Button),

  /* INDEX */
  entry(HomeHero),
  entry(FeaturedProducts),
  entry(CollectionIndex),
  entry(ProductSpotlight),
  entry(MaterialStandard),
  entry(KitCallout),
  entry(RepairAndJournal),

  /* PAGE */
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

/** Every registered type, for tests and the seed script. */
export const WEAVERSE_SECTION_TYPES: readonly string[] =
  WEAVERSE_COMPONENTS.map((component) => component.schema.type);
