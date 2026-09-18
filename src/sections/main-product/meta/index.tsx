"use client";

import { eyebrow } from "@/lib/presentation/variants";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

interface ProductMetaProps extends WeaverseElementProps {
  label?: string;
  showSpecBadge?: boolean;
}

/** Signal eyebrow on the left, the product's lead spec on the right. */
function ProductMeta({ label, showSpecBadge, ...rest }: ProductMetaProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product } = state;
  const text = label ?? "Forward equipment";
  return (
    <div
      {...elementAttributes(rest)}
      className="mb-5.5 flex justify-between gap-5"
    >
      {text === "" ? null : (
        <span className={eyebrow({ tone: "signal" })}>{text}</span>
      )}
      {showSpecBadge === false ? null : (
        <span className="font-field-meta text-caption font-medium text-text-dark-muted tracking-field-meta uppercase">
          {product.specs[0]?.value ?? product.category}
        </span>
      )}
    </div>
  );
}

export default ProductMeta;

export { schema } from "./schema";
