"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

/**
 * The measure stays with the gutter, the way `SHELL_SECTION_CLASS` composed
 * it, so moving a section onto this shell does not shift its content edge.
 */
const variants = cva("relative", {
  variants: {
    width: {
      full: "w-full",
      stretch: "w-full px-page-gutter",
      fixed: "mx-auto w-full max-w-page px-page-gutter",
    },
    verticalPadding: {
      none: "",
      compact: "py-section-block-compact",
      default: "py-section-block",
    },
  },
  defaultVariants: {
    width: "fixed",
    verticalPadding: "default",
  },
});

export interface SectionProps
  extends VariantProps<typeof variants>,
    WeaverseElementProps {
  /** Space between direct children, in px. */
  gap?: number;
  containerClassName?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
}

/**
 * The shell every composed section renders inside.
 *
 * Width and vertical padding are the settings almost every section wants, so
 * they are declared once here and spread into a schema from `./inputs`.
 * Sections that hardcoded `SHELL_SECTION_CLASS` got the same measure with none
 * of it editable; going through this component is what lets a merchant change
 * the page measure globally and override it per section.
 */
export function Section({
  children,
  className,
  containerClassName,
  gap,
  verticalPadding,
  width,
  ...rest
}: SectionProps) {
  return (
    <section {...elementAttributes(rest)} className={cn("relative", className)}>
      <div
        className={cn(variants({ verticalPadding, width }), containerClassName)}
        style={{
          /* Spacing only. Setting `display` here would win over whatever
           * `containerClassName` asks for, which collapsed the multi-column
           * bands into one column the moment a merchant touched the spacing
           * control. A section that lays its own container out keeps that
           * layout; only one with no layout of its own is stacked. */
          ...(gap === undefined ? undefined : { gap: `${gap}px` }),
          ...(gap === undefined || containerClassName !== undefined
            ? undefined
            : { display: "flex", flexDirection: "column" }),
        }}
      >
        {children}
      </div>
    </section>
  );
}
