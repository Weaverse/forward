"use client";

import { createContext, useContext } from "react";

import {
  type ProductSelection,
  resolveProductSelection,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

export type GalleryPosition = "left" | "right";

export interface MainProductState {
  product: Product;
  selection: ProductSelection;
  /** The live query, so option links keep unrelated params like `utm_*`. */
  currentParams: URLSearchParams;
  galleryPosition: GalleryPosition;
}

export const MainProductContext = createContext<MainProductState | null>(null);

/**
 * What every `mp--*` child renders from.
 *
 * Inside `main-product` that is the URL-resolved selection. A child rendered
 * on its own — dropped outside the section in Studio, or mounted by a test —
 * falls back to the route's product at its default selection, and to nothing
 * when the page has no product.
 */
export function useMainProduct(): MainProductState | null {
  const state = useContext(MainProductContext);
  const { product } = useStorefrontContext();
  if (state !== null) return state;
  if (product === undefined) return null;
  return {
    product,
    selection: resolveProductSelection(product, undefined),
    currentParams: new URLSearchParams(),
    galleryPosition: "right",
  };
}
