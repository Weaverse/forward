"use client";

import Link from "next/link";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface FieldPracticeProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}

/** A closing two-column note: heading on the left, copy and link on the right. */
function FieldPractice({
  eyebrowLabel,
  heading,
  body,
  linkLabel,
  linkHref,
  ...rest
}: FieldPracticeProps) {
  return (
    <section {...elementAttributes(rest)} className={SHELL_SECTION_CLASS}>
      <div className="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading()}>{heading}</h2>
        </div>
        <div>
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            {body}
          </p>
          <Link className={textLink()} href={linkHref}>
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FieldPractice;

export { schema } from "./schema";
