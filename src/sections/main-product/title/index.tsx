"use client";

import { cva } from "class-variance-authority";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

const title = cva(
  "mt-0 mb-3 text-balance font-heading font-medium tracking-heading wrap-anywhere",
  {
    variants: {
      size: {
        large: "text-product-title leading-product-title",
        medium: "text-article-heading leading-heading",
      },
    },
    defaultVariants: { size: "large" },
  },
);

interface ProductTitleProps extends WeaverseElementProps {
  as?: "h1" | "h2";
  size?: "large" | "medium";
}

/** The product name; the page's h1 by default. */
function ProductTitle({ as, size, ...rest }: ProductTitleProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const Tag = as ?? "h1";
  return (
    <Tag {...elementAttributes(rest)} className={title({ size })}>
      {state.product.title}
    </Tag>
  );
}

export default ProductTitle;

export { schema } from "./schema";
