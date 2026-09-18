"use client";

import { cva } from "class-variance-authority";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

const summary = cva("mt-6.25 mb-7.5 text-base text-text-dark-muted", {
  variants: {
    maxLines: { none: "", "3": "line-clamp-3", "5": "line-clamp-5" },
  },
  defaultVariants: { maxLines: "none" },
});

interface ProductSummaryProps extends WeaverseElementProps {
  source?: "description" | "subtitle";
  maxLines?: "none" | "3" | "5";
}

/** Short product copy under the price. */
function ProductSummary({ source, maxLines, ...rest }: ProductSummaryProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product } = state;
  const text = source === "subtitle" ? product.subtitle : product.description;
  if (text === "") return null;
  return (
    <p {...elementAttributes(rest)} className={summary({ maxLines })}>
      {text}
    </p>
  );
}

export default ProductSummary;

export { schema } from "./schema";
