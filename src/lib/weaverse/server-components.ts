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
 * Schemas are imported from the `.schema` side of each section rather than
 * from its component module, so importing this file never reaches a Client
 * Component.
 */

import type { WeaverseNextComponent } from "@weaverse/next";

import { schema as buttonSchema } from "@/components/button/schema";
import { schema as headingSchema } from "@/components/heading/schema";
import { schema as paragraphSchema } from "@/components/paragraph/schema";
import { schema as subheadingSchema } from "@/components/subheading/schema";
import { schema as articleBodySchema } from "@/sections/article-body/schema";
import { schema as articleHeaderSchema } from "@/sections/article-header/schema";
import { schema as collectionGridSchema } from "@/sections/collection-grid/schema";
import { schema as collectionHeroSchema } from "@/sections/collection-hero/schema";
import { loader as collection_indexLoader } from "@/sections/collection-index/loader";
import { schema as collection_indexSchema } from "@/sections/collection-index/schema";
import { schema as editorialCalloutSchema } from "@/sections/editorial-callout/schema";
import { schema as editorialHeroSchema } from "@/sections/editorial-hero/schema";
import { schema as editorialOverlayHeroSchema } from "@/sections/editorial-overlay-hero/schema";
import { loader as featured_productsLoader } from "@/sections/featured-products/loader";
import { schema as featured_productsSchema } from "@/sections/featured-products/schema";
import { schema as fieldPracticeSchema } from "@/sections/field-practice/schema";
import { loader as home_heroLoader } from "@/sections/home-hero/loader";
import { schema as home_heroSchema } from "@/sections/home-hero/schema";
import { loader as kit_calloutLoader } from "@/sections/kit-callout/loader";
import { schema as kit_calloutSchema } from "@/sections/kit-callout/schema";
import { schema as material_standardSchema } from "@/sections/material-standard/schema";
import { schema as numberedSequenceSchema } from "@/sections/numbered-sequence/schema";
import { schema as pageHeroSchema } from "@/sections/page-hero/schema";
import { schema as pageOriginSchema } from "@/sections/page-origin/schema";
import { schema as pagePremiseSchema } from "@/sections/page-premise/schema";
import { schema as pageValuesSchema } from "@/sections/page-values/schema";
import { schema as principleGridSchema } from "@/sections/principle-grid/schema";
import { loader as productCaseStudyLoader } from "@/sections/product-case-study/loader";
import { schema as productCaseStudySchema } from "@/sections/product-case-study/schema";
import { loader as product_spotlightLoader } from "@/sections/product-spotlight/loader";
import { schema as product_spotlightSchema } from "@/sections/product-spotlight/schema";
import { loader as productStripLoader } from "@/sections/product-strip/loader";
import { schema as productStripSchema } from "@/sections/product-strip/schema";
import { loader as productTilesLoader } from "@/sections/product-tiles/loader";
import { schema as productTilesSchema } from "@/sections/product-tiles/schema";
import { schema as relatedProductsSchema } from "@/sections/related-products/schema";
import { loader as repair_and_journalLoader } from "@/sections/repair-and-journal/loader";
import { schema as repair_and_journalSchema } from "@/sections/repair-and-journal/schema";
import { schema as standardStatementSchema } from "@/sections/standard-statement/schema";
import { schema as statBandSchema } from "@/sections/stat-band/schema";
import { schema as systemManifestSchema } from "@/sections/system-manifest/schema";

/** The server registry never renders; only the schema and loader are read. */
const NO_RENDER = (() => null) as WeaverseNextComponent["default"];

export const WEAVERSE_SERVER_COMPONENTS: WeaverseNextComponent[] = [
  { default: NO_RENDER, schema: headingSchema },
  { default: NO_RENDER, schema: subheadingSchema },
  { default: NO_RENDER, schema: paragraphSchema },
  { default: NO_RENDER, schema: buttonSchema },

  {
    default: NO_RENDER,
    loader: home_heroLoader,
    schema: home_heroSchema,
  },
  {
    default: NO_RENDER,
    loader: featured_productsLoader,
    schema: featured_productsSchema,
  },
  {
    default: NO_RENDER,
    loader: collection_indexLoader,
    schema: collection_indexSchema,
  },
  {
    default: NO_RENDER,
    loader: product_spotlightLoader,
    schema: product_spotlightSchema,
  },
  { default: NO_RENDER, schema: material_standardSchema },
  {
    default: NO_RENDER,
    loader: kit_calloutLoader,
    schema: kit_calloutSchema,
  },
  {
    default: NO_RENDER,
    loader: repair_and_journalLoader,
    schema: repair_and_journalSchema,
  },

  { default: NO_RENDER, schema: relatedProductsSchema },

  { default: NO_RENDER, schema: collectionHeroSchema },
  { default: NO_RENDER, schema: systemManifestSchema },
  { default: NO_RENDER, schema: collectionGridSchema },
  { default: NO_RENDER, schema: fieldPracticeSchema },

  { default: NO_RENDER, schema: articleHeaderSchema },
  { default: NO_RENDER, schema: articleBodySchema },

  { default: NO_RENDER, schema: pageHeroSchema },
  { default: NO_RENDER, schema: pagePremiseSchema },
  { default: NO_RENDER, schema: pageValuesSchema },
  { default: NO_RENDER, schema: pageOriginSchema },

  { default: NO_RENDER, schema: editorialHeroSchema },
  { default: NO_RENDER, schema: editorialOverlayHeroSchema },
  { default: NO_RENDER, schema: editorialCalloutSchema },
  { default: NO_RENDER, schema: standardStatementSchema },
  { default: NO_RENDER, schema: statBandSchema },
  { default: NO_RENDER, schema: principleGridSchema },
  { default: NO_RENDER, schema: numberedSequenceSchema },

  /* The three sections whose data is resolved server-side. */
  {
    default: NO_RENDER,
    loader: productStripLoader,
    schema: productStripSchema,
  },
  {
    default: NO_RENDER,
    loader: productTilesLoader,
    schema: productTilesSchema,
  },
  {
    default: NO_RENDER,
    loader: productCaseStudyLoader,
    schema: productCaseStudySchema,
  },
];
