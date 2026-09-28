"use client";

import {
  CatalogToolbar,
  type CatalogToolbarSettings,
} from "@/components/catalog-toolbar";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import type { WeaverseElementProps } from "../../weaverse-element";

/** Count and order for the whole catalog; it has no facets to clear. */
function AllProductsToolbar(
  props: CatalogToolbarSettings & WeaverseElementProps,
) {
  const { products, browse } = useStorefrontContext();
  if (products === undefined || browse === undefined) {
    return null;
  }
  return (
    <CatalogToolbar
      {...props}
      count={products.length}
      sort={browse.sort}
      sortId="sort-products"
    />
  );
}

export default AllProductsToolbar;

export { schema } from "./schema";
