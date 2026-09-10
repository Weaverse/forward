"use client";

import { Suspense } from "react";
import {
  ProductDetail,
  ProductDetailFallback,
} from "@/app/products/[productHandle]/product-detail";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";
import { ProductFieldRecord } from "./field-record";

/**
 * The product buy block.
 *
 * Theme-owned means the logic lives in code, not that the surface is invisible
 * to Studio. Gallery, colorway and size selection, price, availability and the
 * cart handoff stay inside `ProductDetail` — they own variant identity and the
 * `colorway`/`size` query state — while a merchant decides where the block sits
 * among the product page's sections and what surrounds it.
 */
function MainProduct({ ...rest }: WeaverseElementProps) {
  const { product } = useStorefrontContext();
  if (product === undefined) return null;
  const fieldRecord = <ProductFieldRecord product={product} />;
  return (
    <div {...elementAttributes(rest)}>
      <Suspense
        fallback={
          <ProductDetailFallback fieldRecord={fieldRecord} product={product} />
        }
      >
        <ProductDetail fieldRecord={fieldRecord} product={product} />
      </Suspense>
    </div>
  );
}

export default MainProduct;

export { schema } from "./schema";
