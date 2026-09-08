"use client";

import Link from "next/link";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";

interface EditorialCalloutProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Three-column closing callout: heading block, body copy, single call to
 * action. Used by the Materials and Field Testing custom pages.
 */
function EditorialCallout({
  eyebrowLabel,
  heading,
  body,
  ctaLabel,
  ctaHref,
}: EditorialCalloutProps) {
  return (
    <section className="mx-auto grid w-full max-w-page grid-cols-spec-row items-end gap-11.25 px-page-gutter py-section-block max-md:grid-cols-1">
      <div>
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
      </div>
      <p>{body}</p>
      <Link className={cta()} href={ctaHref}>
        {ctaLabel}
      </Link>
    </section>
  );
}

export default EditorialCallout;

export { schema } from "./schema";
