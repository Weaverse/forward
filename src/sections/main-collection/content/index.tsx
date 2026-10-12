"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { Section, type SectionProps } from "@/components/section";

import type { WeaverseElementProps } from "../../weaverse-element";

type Gap = "sm" | "md" | "lg";

/* The toolbar above is full-bleed by design, so the content width belongs to
 * this row rather than the shell. */
const row = cva("flex flex-col items-start pt-15.5 lg:flex-row", {
  variants: {
    gap: { sm: "gap-6", md: "gap-9", lg: "gap-12" },
  },
  defaultVariants: { gap: "md" },
});

interface CollectionContentProps extends WeaverseElementProps {
  children?: ReactNode;
  gap?: Gap;
  width?: SectionProps["width"];
}

/**
 * The results row: the facet sidebar beside the grid.
 *
 * Which side the sidebar sits on is the order the merchant put the children
 * in, not a setting — a flex row already answers that, and a "position"
 * control would fight whatever the outline says.
 */
function CollectionContent({
  gap,
  width = "fixed",
  ...rest
}: CollectionContentProps) {
  return (
    <Section
      {...rest}
      containerClassName={row({ gap })}
      verticalPadding="none"
      width={width}
    />
  );
}

export default CollectionContent;

export { schema } from "./schema";
