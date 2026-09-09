"use client";

import type { ReactNode } from "react";

import { Section } from "@/components/section";
import type { WeaverseElementProps } from "../weaverse-element";

interface FieldPracticeProps extends WeaverseElementProps {
  children?: ReactNode;
}

/**
 * A closing two-column note.
 *
 * The section owns the split, not the words: each column is a `section-content`
 * child a merchant fills with elements, so the heading size, the copy width and
 * whether the link is a button or a text link are all editable — none of which
 * was true when the four strings were flat settings on this component.
 */
function FieldPractice({ children, ...rest }: FieldPracticeProps) {
  return (
    <Section
      {...rest}
      containerClassName="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1"
    >
      {children}
    </Section>
  );
}

export default FieldPractice;

export { schema } from "./schema";
