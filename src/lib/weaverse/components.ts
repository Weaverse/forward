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
 * - Home's seven sections, which stay Server Components. Composing them would
 *   ship their JavaScript to the browser and lose the zero-JS baseline on the
 *   highest-traffic page, buying nothing a shopper can see.
 * - Header, Footer, announcement bar, and mini-cart, configured through theme
 *   settings and never composed.
 * - The PDP buy block and its `colorway`/`size` query state, the collection and
 *   Shop grid behavior, Cart, and `/account/**`.
 * - `index-header`, `journal-*`, `product-results`, `search-*`, and
 *   `policy-document`, extracted for code organization only.
 */

import type { WeaverseNextComponent } from "@weaverse/next";

import * as Button from "@/components/button";
import * as Heading from "@/components/heading";
import * as Paragraph from "@/components/paragraph";
import * as Subheading from "@/components/subheading";
import * as EditorialCallout from "@/sections/editorial-callout";
import * as EditorialHero from "@/sections/editorial-hero";
import * as EditorialOverlayHero from "@/sections/editorial-overlay-hero";
import * as NumberedSequence from "@/sections/numbered-sequence";
import * as PrincipleGrid from "@/sections/principle-grid";
import * as ProductCaseStudy from "@/sections/product-case-study";
import * as ProductStrip from "@/sections/product-strip";
import * as ProductTiles from "@/sections/product-tiles";
import * as StandardStatement from "@/sections/standard-statement";
import * as StatBand from "@/sections/stat-band";

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
  /* Shared elements, usable inside any composed section. */
  entry(Heading),
  entry(Subheading),
  entry(Paragraph),
  entry(Button),

  /* PAGE — the three editorial routes. */
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
