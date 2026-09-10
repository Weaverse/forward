"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { blockSpacing } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

const variants = cva("flex flex-wrap items-center gap-6", {
  variants: {
    direction: { row: "flex-row", col: "flex-col items-start" },
  },
  defaultVariants: { direction: "row" },
});

interface ButtonsProps
  extends VariantProps<typeof variants>,
    VariantProps<typeof blockSpacing>,
    WeaverseElementProps {
  children?: ReactNode;
}

/** A row of calls to action. Wraps on narrow viewports rather than overflowing. */
function Buttons({
  direction,
  marginBottom,
  marginTop,
  children,
  ...rest
}: ButtonsProps) {
  return (
    <div
      {...elementAttributes(rest)}
      className={cn(
        variants({ direction }),
        blockSpacing({ marginTop, marginBottom }),
      )}
    >
      {children}
    </div>
  );
}

export default Buttons;

export { schema } from "./schema";
