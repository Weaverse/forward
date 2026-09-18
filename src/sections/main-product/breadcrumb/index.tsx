"use client";

import Link from "next/link";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

interface ProductBreadcrumbProps extends WeaverseElementProps {
  shopLabel?: string;
  showCategory?: boolean;
}

/** Shop / category trail above the product meta. */
function ProductBreadcrumb({
  shopLabel,
  showCategory,
  ...rest
}: ProductBreadcrumbProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product } = state;
  return (
    <p
      {...elementAttributes(rest)}
      className="mb-7 font-field-meta text-ui font-medium text-text-dark-muted tracking-field-meta uppercase"
    >
      <Link href="/shop">{shopLabel || "Shop"}</Link>
      {showCategory === false ? null : (
        <>
          {" / "}
          <Link href={`/shop?category=${product.category}`}>
            {product.category}
          </Link>
        </>
      )}
    </p>
  );
}

export default ProductBreadcrumb;

export { schema } from "./schema";
