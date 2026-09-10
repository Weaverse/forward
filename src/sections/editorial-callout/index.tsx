"use client";

import type { ReactNode } from "react";

import { Section } from "@/components/section";
import type { WeaverseElementProps } from "../weaverse-element";

interface EditorialCalloutProps extends WeaverseElementProps {
  children?: ReactNode;
}

/**
 * Three-column closing callout: heading block, body copy, single call to
 * action. Used by the Materials and Field Testing custom pages.
 *
 * The section owns the three-column split; each column is a `section-content`
 * child, so what goes in them — and whether the call to action is a button or
 * a text link — is the merchant's decision rather than a fixed prop shape.
 */
function EditorialCallout({ children, ...rest }: EditorialCalloutProps) {
  return (
    <Section
      {...rest}
      containerClassName="grid grid-cols-spec-row items-end gap-11.25 max-md:grid-cols-1"
    >
      {children}
    </Section>
  );
}

export default EditorialCallout;

export { schema } from "./schema";
