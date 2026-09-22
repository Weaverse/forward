"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { sectionHeading } from "@/lib/presentation/variants";

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

/** The page header, for the theme's own fallback composition. */
export function AllProductsHeader({
  heading,
  lede,
}: {
  heading: string;
  lede: string;
}) {
  return (
    <div className="mx-auto w-full max-w-page px-page-gutter pt-15.5 pb-10">
      <h1 className={sectionHeading({ size: "page" })}>{heading}</h1>
      <p className="mt-5 max-w-lede text-lede leading-lede text-text-muted">
        {lede}
      </p>
    </div>
  );
}

export default AllProducts;

export { schema } from "./schema";
