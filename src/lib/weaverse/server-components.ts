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
import { schema as editorialCalloutSchema } from "@/sections/editorial-callout/schema";
import { schema as editorialHeroSchema } from "@/sections/editorial-hero/schema";
import { schema as editorialOverlayHeroSchema } from "@/sections/editorial-overlay-hero/schema";
import { schema as numberedSequenceSchema } from "@/sections/numbered-sequence/schema";
import { schema as principleGridSchema } from "@/sections/principle-grid/schema";
import { loader as productCaseStudyLoader } from "@/sections/product-case-study/loader";
import { schema as productCaseStudySchema } from "@/sections/product-case-study/schema";
import { loader as productStripLoader } from "@/sections/product-strip/loader";
import { schema as productStripSchema } from "@/sections/product-strip/schema";
import { loader as productTilesLoader } from "@/sections/product-tiles/loader";
import { schema as productTilesSchema } from "@/sections/product-tiles/schema";
import { schema as standardStatementSchema } from "@/sections/standard-statement/schema";
import { schema as statBandSchema } from "@/sections/stat-band/schema";

/** The server registry never renders; only the schema and loader are read. */
const NO_RENDER = (() => null) as WeaverseNextComponent["default"];

export const WEAVERSE_SERVER_COMPONENTS: WeaverseNextComponent[] = [
  { default: NO_RENDER, schema: headingSchema },
  { default: NO_RENDER, schema: subheadingSchema },
  { default: NO_RENDER, schema: paragraphSchema },
  { default: NO_RENDER, schema: buttonSchema },

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
