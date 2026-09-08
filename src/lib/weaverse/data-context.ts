"use client";

import { useWeaverse } from "@weaverse/next";

import type {
  Collection,
  JournalArticle,
  Product,
  StorePage,
  ThemeContent,
} from "@/lib/storefront/types";

/**
 * Storefront data the route supplies to a composed page.
 *
 * Resource-backed page types differ from `CUSTOM` pages in where their content
 * comes from. A custom page's sections each select their own resource through
 * a picker, resolved by that section's loader. A product, collection, page, or
 * article template is shared across every resource of its kind, and the one it
 * renders is decided by the route, not by the merchant — so the route loads it
 * and hands it down here.
 *
 * Everything in this shape has already passed through the `storefront` data
 * source, so a section still never sees a raw Shopify payload.
 */
export interface StorefrontDataContext {
  /* The renderer takes a plain record, so the shape stays index-signature
   * compatible while the named fields keep sections honestly typed. */
  [key: string]: unknown;
  article?: JournalArticle;
  collection?: Collection;
  collectionProducts?: readonly Product[];
  page?: StorePage;
  product?: Product;
  products?: readonly Product[];
  collections?: readonly Collection[];
  articles?: readonly JournalArticle[];
  theme?: ThemeContent;
}

/**
 * Reads the route-provided storefront data.
 *
 * Returns an empty object rather than throwing when a section renders outside
 * a composed page — in Studio a merchant can drop a product section onto a
 * page that has no product, and that should render an empty state, not crash
 * the editor.
 */
export function useStorefrontContext(): StorefrontDataContext {
  const weaverse = useWeaverse();
  const context = weaverse?.dataContext as StorefrontDataContext | undefined;
  return context ?? {};
}
