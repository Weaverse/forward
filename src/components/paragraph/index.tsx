"use client";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { blockSpacing } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

type ParagraphWidth = "lede" | "prose" | "full";

const WIDTH_CLASS: Record<ParagraphWidth, string> = {
  lede: "max-w-lede text-lede leading-lede",
  prose: "max-w-prose",
  full: "",
};

export interface ParagraphProps
  extends VariantProps<typeof blockSpacing>,
    WeaverseElementProps {
  content: string;
  width?: ParagraphWidth;
  className?: string;
}

/**
 * Shared body-copy element.
 *
 * Width is a named choice rather than a free number so Studio copy cannot
 * drift outside the measure the type scale was designed around.
 */
function Paragraph({
  className,
  content,
  marginBottom,
  marginTop,
  width = "prose",
  ...rest
}: ParagraphProps) {
  return (
    <p
      {...elementAttributes(rest)}
      className={cn(
        WIDTH_CLASS[width],
        blockSpacing({ marginTop, marginBottom }),
        className,
      )}
    >
      {content}
    </p>
  );
}

export default Paragraph;

export { schema } from "./schema";
