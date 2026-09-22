"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

type Gap = "sm" | "md" | "lg";

/* The toolbar above is full-bleed by design, so the page container belongs to
 * this row rather than the shell. */
const row = cva(
  "mx-auto flex w-full max-w-page flex-col items-start px-page-gutter pt-15.5 lg:flex-row",
  {
    variants: {
      gap: { sm: "gap-6", md: "gap-9", lg: "gap-12" },
    },
    defaultVariants: { gap: "md" },
  },
);

interface CollectionContentProps extends WeaverseElementProps {
  children?: ReactNode;
  gap?: Gap;
}

/**
 * The results row: the facet sidebar beside the grid.
 *
 * Which side the sidebar sits on is the order the merchant put the children
 * in, not a setting — a flex row already answers that, and a "position"
 * control would fight whatever the outline says.
 */
function CollectionContent({ children, gap, ...rest }: CollectionContentProps) {
  return (
    <div {...elementAttributes(rest)} className={row({ gap })}>
      {children}
    </div>
  );
}

export default CollectionContent;

export { schema } from "./schema";
