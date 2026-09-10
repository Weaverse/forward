"use client";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { blockSpacing, sectionHeading } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

type HeadingSize =
  | "display"
  | "section"
  | "subsection"
  | "subsectionSpaced"
  | "hero"
  | "heroWide"
  | "page"
  | "collection"
  | "article"
  | "statement"
  | "feature";
type HeadingTag = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps
  extends VariantProps<typeof blockSpacing>,
    WeaverseElementProps {
  content: string;
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
}

/**
 * Shared heading element.
 *
 * Presentation comes from the existing `sectionHeading` recipe, so a heading
 * authored in Studio and one authored in a route render identically. `as`
 * stays separate from `size` because heading level is document structure, not
 * appearance: a visually small heading may still be the page's `h1`.
 */
function Heading({
  as: Tag = "h2",
  className,
  content,
  marginBottom,
  marginTop,
  size = "section",
  ...rest
}: HeadingProps) {
  return (
    <Tag
      {...elementAttributes(rest)}
      className={cn(
        sectionHeading({ size }),
        blockSpacing({ marginTop, marginBottom }),
        className,
      )}
    >
      {content}
    </Tag>
  );
}

export default Heading;

export { schema } from "./schema";
