"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

type Spacing = "compact" | "standard" | "roomy";

const shell = cva("w-full", {
  variants: {
    spacing: { compact: "pb-14", standard: "pb-25", roomy: "pb-37.5" },
  },
  defaultVariants: { spacing: "standard" },
});

interface AllProductsProps extends WeaverseElementProps {
  children?: ReactNode;
  spacing?: Spacing;
}

/**
 * The whole-catalog browse block.
 *
 * Order and paging are query state the route resolves; this shell owns layout
 * and nothing else. The toolbar is full-bleed by design, so only the header
 * children are wrapped in the page container.
 */
function AllProducts({ children, spacing, ...rest }: AllProductsProps) {
  return (
    <div {...elementAttributes(rest)} className={shell({ spacing })}>
      {children}
    </div>
  );
}

export default AllProducts;

export { schema } from "./schema";
