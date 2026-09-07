import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import { cn } from "@/lib/cn";
import type { PageSection } from "@/lib/storefront/types";

interface PageValuesProps {
  eyebrowSuffix: string;
  sections: readonly PageSection[];
}

/** Staggered field-standard cards, numbered in page order. */
export function PageValues({ eyebrowSuffix, sections }: PageValuesProps) {
  return (
    <section className="mx-auto w-full max-w-page px-page-gutter py-section-block-compact">
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
