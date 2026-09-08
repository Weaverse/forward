"use client";

import { cn } from "@/lib/cn";
import { eyebrow } from "@/lib/presentation/variants";

type SubheadingTone = "strong" | "signal" | "warm";

export interface SubheadingProps {
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
function Subheading({ className, content, tone = "strong" }: SubheadingProps) {
  return <p className={cn(eyebrow({ tone }), className)}>{content}</p>;
}

export default Subheading;

export { schema } from "./schema";
