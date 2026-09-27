"use client";

import { createContext, useContext } from "react";

import type { ProductSelection } from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

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
 * What every `mp--*` child renders from: the URL-resolved selection its
 * `main-product` shell provides. A child outside that shell renders nothing.
 */
export function useMainProduct(): MainProductState | null {
  return useContext(MainProductContext);
}
