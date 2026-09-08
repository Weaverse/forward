/**
 * Every component type this theme registers.
 *
 * Built from the schema modules alone, which have no server or client
 * dependencies, so tooling outside Next — the seed script in particular — can
 * import this without pulling in `server-only` or a Client Component.
 *
 * Both registries are checked against this list in `tests/weaverse-registry.test.ts`,
 * so a component added to one registry and forgotten in the other fails the
 * suite rather than silently disappearing from Builder.
 */

import { schema as buttonSchema } from "@/components/button/schema";
import { schema as headingSchema } from "@/components/heading/schema";
import { schema as paragraphSchema } from "@/components/paragraph/schema";
import { schema as subheadingSchema } from "@/components/subheading/schema";
import { schema as articleBodySchema } from "@/sections/article-body/schema";
import { schema as articleHeaderSchema } from "@/sections/article-header/schema";
import { schema as collectionGridSchema } from "@/sections/collection-grid/schema";
import { schema as collectionHeroSchema } from "@/sections/collection-hero/schema";
import { schema as collection_indexSchema } from "@/sections/collection-index/schema";
import { schema as editorialCalloutSchema } from "@/sections/editorial-callout/schema";
import { schema as editorialHeroSchema } from "@/sections/editorial-hero/schema";
import { schema as editorialOverlayHeroSchema } from "@/sections/editorial-overlay-hero/schema";
import { schema as featured_productsSchema } from "@/sections/featured-products/schema";
import { schema as fieldPracticeSchema } from "@/sections/field-practice/schema";
import { schema as home_heroSchema } from "@/sections/home-hero/schema";
import { schema as kit_calloutSchema } from "@/sections/kit-callout/schema";
import { schema as material_standardSchema } from "@/sections/material-standard/schema";
import { schema as numberedSequenceSchema } from "@/sections/numbered-sequence/schema";
import { schema as pageHeroSchema } from "@/sections/page-hero/schema";
import { schema as pageOriginSchema } from "@/sections/page-origin/schema";
import { schema as pagePremiseSchema } from "@/sections/page-premise/schema";
import { schema as pageValuesSchema } from "@/sections/page-values/schema";
import { schema as principleGridSchema } from "@/sections/principle-grid/schema";
import { schema as productCaseStudySchema } from "@/sections/product-case-study/schema";
import { schema as product_spotlightSchema } from "@/sections/product-spotlight/schema";
import { schema as productStripSchema } from "@/sections/product-strip/schema";
import { schema as productTilesSchema } from "@/sections/product-tiles/schema";
import { schema as relatedProductsSchema } from "@/sections/related-products/schema";
import { schema as repair_and_journalSchema } from "@/sections/repair-and-journal/schema";
import { schema as standardStatementSchema } from "@/sections/standard-statement/schema";
import { schema as statBandSchema } from "@/sections/stat-band/schema";
import { schema as systemManifestSchema } from "@/sections/system-manifest/schema";

export const WEAVERSE_SECTION_TYPES: readonly string[] = [
  headingSchema.type,
  subheadingSchema.type,
  paragraphSchema.type,
  buttonSchema.type,
  home_heroSchema.type,
  featured_productsSchema.type,
  collection_indexSchema.type,
  product_spotlightSchema.type,
  material_standardSchema.type,
  kit_calloutSchema.type,
  repair_and_journalSchema.type,
  relatedProductsSchema.type,
  collectionHeroSchema.type,
  systemManifestSchema.type,
  collectionGridSchema.type,
  fieldPracticeSchema.type,
  articleHeaderSchema.type,
  articleBodySchema.type,
  pageHeroSchema.type,
  pagePremiseSchema.type,
  pageValuesSchema.type,
  pageOriginSchema.type,
  editorialHeroSchema.type,
  editorialOverlayHeroSchema.type,
  editorialCalloutSchema.type,
  standardStatementSchema.type,
  statBandSchema.type,
  productStripSchema.type,
  principleGridSchema.type,
  productTilesSchema.type,
  numberedSequenceSchema.type,
  productCaseStudySchema.type,
];
