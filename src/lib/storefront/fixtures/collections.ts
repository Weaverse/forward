/**
 * Deterministic collection records mirroring the live Shopify collection
 * contract. Only the static data source may import this file.
 */

import { COLLECTION_PRESENTATION_PROFILES } from "../collection-presentation";
import type { Collection } from "../types";
import { PRODUCT_FIXTURES } from "./products";

export const COLLECTION_FIXTURES: readonly Collection[] =
  COLLECTION_PRESENTATION_PROFILES.map((profile) => ({
    handle: profile.handle,
    title: profile.title,
    fieldCode: profile.fieldCode,
    description: profile.description,
    heroImage: profile.heroImage,
    /* An empty list means the whole catalog, so the complete collection
     * cannot fall behind the products the store actually returns. */
    productHandles:
      profile.productHandles.length > 0
        ? profile.productHandles
        : PRODUCT_FIXTURES.map((product) => product.handle),
  }));
