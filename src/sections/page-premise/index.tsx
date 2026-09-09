"use client";

import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
} from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface PagePremiseProps extends WeaverseElementProps {
  eyebrowLabel: string;
}

/**
 * Opening statement of a custom page: heading beside intro and body copy.
 *
 * The intro and the first body section are the page's own content, edited in
 * Shopify; only the eyebrow is a template setting.
 */
function PagePremise({ eyebrowLabel, ...rest }: PagePremiseProps) {
  const { page } = useStorefrontContext();
  if (page === undefined) return null;
  const premise = page.sections[0];
  return (
    <section {...elementAttributes(rest)} className={SHELL_SECTION_CLASS}>
      <div className="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          {premise !== undefined ? (
            <h2 className={sectionHeading()}>{premise.heading}</h2>
          ) : null}
        </div>
        <div>
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            {page.intro}
          </p>
          {premise?.paragraphs.map((paragraph) => (
            <p
              key={`${premise.heading}:${richTextParagraphKey(paragraph)}`}
              className="text-text-muted"
            >
              <RichTextParagraph paragraph={paragraph} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PagePremise;

export { schema } from "./schema";
