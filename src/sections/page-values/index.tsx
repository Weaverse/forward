"use client";

import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import { cn } from "@/lib/cn";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface PageValuesProps extends WeaverseElementProps {
  eyebrowSuffix: string;
}

/**
 * Staggered field-standard cards, numbered in page order.
 *
 * Renders the page's body sections after the premise, so the card count
 * follows the page a merchant wrote rather than a template setting.
 */
function PageValues({ eyebrowSuffix, ...rest }: PageValuesProps) {
  const { page } = useStorefrontContext();
  const sections = page?.sections.slice(1) ?? [];
  if (sections.length === 0) return null;
  return (
    <section
      {...elementAttributes(rest)}
      className="mx-auto w-full max-w-page px-page-gutter py-section-block-compact"
    >
      <div className="grid grid-cols-12 gap-3 max-sm:grid-cols-1">
        {sections.map((section, index) => (
          <article
            key={section.heading}
            className={cn(
              "col-span-6 min-h-82.5 border border-ink bg-transparent p-[clamp(34px,5vw,70px)] max-sm:col-auto",
              index % 2 === 1 &&
                "translate-y-17.5 bg-surface-subtle max-sm:translate-y-0",
            )}
          >
            <span className="font-field-meta text-ui font-medium text-signal-strong tracking-field-meta">
              {String(index + 1).padStart(2, "0")} / {eyebrowSuffix}
            </span>
            <h2 className="mt-12.5 mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={`${section.heading}:${richTextParagraphKey(paragraph)}`}
                className="text-text-muted"
              >
                <RichTextParagraph paragraph={paragraph} />
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default PageValues;

export { schema } from "./schema";
