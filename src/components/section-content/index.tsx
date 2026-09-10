"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

const variants = cva("flex min-w-0 flex-col", {
  variants: {
    alignment: {
      start: "items-start text-left",
      center: "items-center text-center",
      end: "items-end text-right",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
    },
  },
  defaultVariants: { alignment: "start", justify: "start" },
});

interface SectionContentProps
  extends VariantProps<typeof variants>,
    WeaverseElementProps {
  children?: ReactNode;
}

/**
 * A column of shared elements inside a section.
 *
 * This is the piece that was missing: `heading`, `subheading`, `paragraph` and
 * `button` were registered but had nowhere to be placed, because no section
 * accepted children. A section now nests one of these per layout slot — a
 * two-column band uses two — and the merchant fills each with elements rather
 * than editing one flat string per slot.
 */
function SectionContent({
  alignment,
  justify,
  children,
  ...rest
}: SectionContentProps) {
  return (
    <div
      {...elementAttributes(rest)}
      className={cn(variants({ alignment, justify }))}
    >
      {children}
    </div>
  );
}

export default SectionContent;

export { schema } from "./schema";
