"use client";

import {
  CatalogToolbar,
  type CatalogToolbarSettings,
} from "@/components/catalog-toolbar";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import type { WeaverseElementProps } from "../../weaverse-element";

/** Count, clear filters and order for the collection the route resolved. */
function CollectionToolbar(
  props: CatalogToolbarSettings & WeaverseElementProps,
) {
  const { collectionProducts, browse } = useStorefrontContext();
  if (collectionProducts === undefined || browse === undefined) {
    return null;
  }
  return (
    <CatalogToolbar
      {...props}
      count={collectionProducts.length}
      sort={browse.sort}
      sortId="sort-collection"
      clearable
    />
  );
}

export default CollectionToolbar;

export { schema } from "./schema";
