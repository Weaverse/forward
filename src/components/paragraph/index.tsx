"use client";

import { cn } from "@/lib/cn";
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

export interface ParagraphProps extends WeaverseElementProps {
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
  width = "prose",
  ...rest
}: ParagraphProps) {
  return (
    <p
      {...elementAttributes(rest)}
      className={cn(WIDTH_CLASS[width], className)}
    >
      {content}
    </p>
  );
}

export default Paragraph;

export { schema } from "./schema";
