"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

type Spacing = "compact" | "standard" | "roomy";

const shell = cva("w-full", {
  variants: {
    spacing: {
      compact: "pb-14",
      standard: "pb-25",
      roomy: "pb-37.5",
    },
  },
  defaultVariants: { spacing: "standard" },
});

interface MainCollectionProps extends WeaverseElementProps {
  children?: ReactNode;
  spacing?: Spacing;
}

/**
 * The collection browse block, composed from `mc--toolbar` and `mc--content`.
 *
 * The shell owns layout and nothing else. Filter and sort are query state the
 * route resolves and validates before any product is read, and it arrives here
 * through the storefront data context — so a merchant reordering this tree can
 * never change what a filter means or which products a URL selects.
 */
function MainCollection({ children, spacing, ...rest }: MainCollectionProps) {
  const { collection } = useStorefrontContext();
  if (collection === undefined) return null;

  return (
    <div {...elementAttributes(rest)} className={shell({ spacing })}>
      {children}
    </div>
  );
}

export default MainCollection;

export { schema } from "./schema";
