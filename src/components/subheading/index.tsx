"use client";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { blockSpacing, eyebrow } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

type SubheadingTone = "strong" | "signal" | "warm";

export interface SubheadingProps
  extends VariantProps<typeof blockSpacing>,
    WeaverseElementProps {
  content: string;
  tone?: SubheadingTone;
  className?: string;
}

/**
 * Shared eyebrow / subheading element.
 *
 * Rendered as a paragraph rather than a heading tag: it labels the section
 * that follows and must not add a level to the document outline.
 */
function Subheading({
  className,
  content,
  marginBottom,
  marginTop,
  tone = "strong",
  ...rest
}: SubheadingProps) {
  return (
    <p
      {...elementAttributes(rest)}
      className={cn(
        eyebrow({ tone }),
        blockSpacing({ marginTop, marginBottom }),
        className,
      )}
    >
      {content}
    </p>
  );
}

export default Subheading;

export { schema } from "./schema";
