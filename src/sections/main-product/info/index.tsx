"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

const panel = cva(
  "relative col-start-1 row-start-2 border-border-dark border-t text-text-inverse md:row-start-1 md:border-t-0",
  {
    variants: {
      position: {
        /* Where the gallery sits; the panel takes the other column. */
        right: "md:col-start-1 md:border-r",
        left: "md:col-start-2 md:border-l",
      },
    },
    defaultVariants: { position: "right" },
  },
);

const inner = cva(
  "bg-ink px-page-gutter pt-11 pb-17.5 md:p-8.5 lg:p-[clamp(36px,5vw,80px)]",
  {
    variants: {
      sticky: {
        true: "md:sticky md:top-[calc(var(--spacing-header)+30px)]",
        false: "",
      },
    },
    defaultVariants: { sticky: true },
  },
);

interface ProductInfoProps extends WeaverseElementProps {
  children?: ReactNode;
  sticky?: boolean;
}

/** The purchase panel: whatever `mp--*` elements the merchant stacks in it. */
function ProductInfo({ children, sticky, ...rest }: ProductInfoProps) {
  const state = useMainProduct();
  return (
    <section
      {...elementAttributes(rest)}
      className={panel({ position: state?.galleryPosition })}
      aria-label="Purchase panel"
    >
      <div className={inner({ sticky: sticky !== false })}>{children}</div>
    </section>
  );
}

export default ProductInfo;

export { schema } from "./schema";
