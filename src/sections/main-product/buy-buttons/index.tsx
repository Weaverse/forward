"use client";

import { AddToCartForm } from "@/components/add-to-cart-form";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

interface ProductBuyButtonsProps extends WeaverseElementProps {
  addToCartText?: string;
  soldOutText?: string;
  showCartNote?: boolean;
}

/**
 * Quantity and add to cart for the selected variant.
 *
 * All cart logic stays in the shared `AddToCartForm`; this only hands it the
 * section's selection. Keyed by variant so quantity and status reset when the
 * shopper picks another one.
 */
function ProductBuyButtons({
  addToCartText,
  soldOutText,
  showCartNote,
  ...rest
}: ProductBuyButtonsProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product, selection } = state;
  return (
    <div {...elementAttributes(rest)}>
      <AddToCartForm
        key={selection.variant.id}
        product={product}
        selection={selection}
        addToCartText={addToCartText || undefined}
        soldOutText={soldOutText || undefined}
        showCartNote={showCartNote !== false}
      />
    </div>
  );
}

export default ProductBuyButtons;

export { schema } from "./schema";
