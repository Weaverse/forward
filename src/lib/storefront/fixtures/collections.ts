/**
 * Deterministic collection records mirroring the approved live Shopify
 * collection contract. Only the static data source may import this file.
 */

import { COLLECTION_PRESENTATION_PROFILES } from "../collection-presentation";
import type { Collection } from "../types";

export const COLLECTION_FIXTURES: readonly Collection[] =
  COLLECTION_PRESENTATION_PROFILES.map((profile) => ({
    handle: profile.handle,
    title: profile.title,
    fieldCode: profile.fieldCode,
    description: profile.description,
    heroImage: profile.heroImage,
    productHandles: profile.productHandles,
  }));
