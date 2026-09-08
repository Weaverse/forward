import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
} from "@/lib/presentation/variants";
import type { PageSection } from "@/lib/storefront/types";

interface PagePremiseProps {
  eyebrowLabel: string;
  intro: string;
  /** Omitted when the page has no body sections; the heading is then dropped. */
  premise?: PageSection;
}

/** Opening statement of a custom page: heading beside intro and body copy. */
export function PagePremise({
  eyebrowLabel,
  intro,
  premise,
}: PagePremiseProps) {
  return (
    <section className={SHELL_SECTION_CLASS}>
      <div className="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          {premise !== undefined ? (
            <h2 className={sectionHeading()}>{premise.heading}</h2>
          ) : null}
        </div>
        <div>
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            {intro}
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
