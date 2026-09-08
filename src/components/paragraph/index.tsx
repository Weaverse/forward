"use client";

import { cn } from "@/lib/cn";

type ParagraphWidth = "lede" | "prose" | "full";

const WIDTH_CLASS: Record<ParagraphWidth, string> = {
  lede: "max-w-lede text-lede leading-lede",
  prose: "max-w-prose",
  full: "",
};

export interface ParagraphProps {
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
function Paragraph({ className, content, width = "prose" }: ParagraphProps) {
  return <p className={cn(WIDTH_CLASS[width], className)}>{content}</p>;
}

export default Paragraph;

export { schema } from "./schema";
