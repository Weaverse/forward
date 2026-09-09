import "server-only";

/**
 * The server component registry — schemas and loaders, no rendering.
 *
 * The server client needs two things: the schema, so it can supply defaults
 * and serialize the registry to Builder, and the loader, so each item's data
 * is resolved before the payload reaches the browser. It never renders, so the
 * `default` slot holds a stub. Rendering belongs to `./components.ts`, which is
 * a Client Component module this file must not import — pulling it in would
 * drag every section into the server graph and the loaders into the browser.
 *
 * The schema list lives in `./section-schemas.ts` so this file only has to say
 * which sections resolve data server-side.
 */

import type { WeaverseNextComponent } from "@weaverse/next";

import { loader as collectionIndexLoader } from "@/sections/collection-index/loader";
import { loader as featuredProductsLoader } from "@/sections/featured-products/loader";
import { loader as homeHeroLoader } from "@/sections/home-hero/loader";
import { loader as kitCalloutLoader } from "@/sections/kit-callout/loader";
import { loader as productCaseStudyLoader } from "@/sections/product-case-study/loader";
import { loader as productSpotlightLoader } from "@/sections/product-spotlight/loader";
import { loader as productStripLoader } from "@/sections/product-strip/loader";
import { loader as productTilesLoader } from "@/sections/product-tiles/loader";
import { loader as repairAndJournalLoader } from "@/sections/repair-and-journal/loader";
import { SECTION_SCHEMAS } from "./section-schemas";

/**
 * The sections whose data is resolved before render, keyed by component type.
 *
 * Everything else takes its data from the route through `dataContext`, or has
 * no data at all beyond its settings.
 */
const LOADERS: Record<string, WeaverseNextComponent["loader"]> = {
  "collection-index": collectionIndexLoader,
  "featured-products": featuredProductsLoader,
  "home-hero": homeHeroLoader,
  "kit-callout": kitCalloutLoader,
  "product-case-study": productCaseStudyLoader,
  "product-spotlight": productSpotlightLoader,
  "product-strip": productStripLoader,
  "product-tiles": productTilesLoader,
  "repair-and-journal": repairAndJournalLoader,
};

/** The server registry never renders; only the schema and loader are read. */
const NO_RENDER = (() => null) as WeaverseNextComponent["default"];

export const WEAVERSE_SERVER_COMPONENTS: WeaverseNextComponent[] =
  SECTION_SCHEMAS.map((schema) => {
    const loader = LOADERS[schema.type];
    return { default: NO_RENDER, schema, ...(loader && { loader }) };
  });
