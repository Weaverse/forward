"use client";

import { createContext, type ReactNode, useContext } from "react";

import type {
  Collection,
  JournalArticle,
  Product,
  StorePage,
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
  article?: JournalArticle;
  collection?: Collection;
  collectionProducts?: readonly Product[];
  page?: StorePage;
  product?: Product;
  products?: readonly Product[];
}

const StorefrontData = createContext<StorefrontDataContext>({});

/**
 * Supplies route-loaded storefront data to the sections below it.
 *
 * `WeaversePage` wraps the renderer in this, and a route's own fallback wraps
 * the same sections in it directly. That is the point: a section reads its
 * resource from one place whether Weaverse composed the page or the theme
 * rendered it from its own defaults, so the credential-free storefront and the
 * composed one run the same component code.
 */
export function StorefrontDataProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: StorefrontDataContext;
}) {
  return <StorefrontData value={value}>{children}</StorefrontData>;
}

/**
 * Reads the route-provided storefront data.
 *
 * Defaults to an empty object rather than throwing when a section renders
 * outside a provider — in Studio a merchant can drop a product section onto a
 * page that has no product, and that should render an empty state, not crash
 * the editor.
 */
export function useStorefrontContext(): StorefrontDataContext {
  return useContext(StorefrontData);
}
