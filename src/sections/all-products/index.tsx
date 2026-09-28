"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { browseShell } from "@/lib/presentation/variants";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface AllProductsProps extends WeaverseElementProps {
  children?: ReactNode;
  spacing?: VariantProps<typeof browseShell>["spacing"];
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
    <div {...elementAttributes(rest)} className={browseShell({ spacing })}>
      {children}
    </div>
  );
}

export default AllProducts;

export { schema } from "./schema";
