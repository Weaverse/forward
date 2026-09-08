import Link from "next/link";

import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import { cta, eyebrow } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import type { Policy } from "@/lib/storefront/types";

interface PolicyDocumentProps {
  policy: Policy;
  /** Every policy, for the sibling navigation column. */
  allPolicies: readonly Policy[];
  /** Renders the account link only where Customer Account is configured. */
  accountEnabled: boolean;
}

/** Shopify policy text rendered verbatim beside its sibling navigation. */
export function PolicyDocument({
  policy,
  allPolicies,
  accountEnabled,
}: PolicyDocumentProps) {
  return (
    <article>
      <div className="mx-auto grid w-full max-w-page grid-cols-article-body justify-center gap-article-gap px-page-gutter py-section-block-short max-md:grid-cols-1">
        <aside className="text-caption text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
          <p className={eyebrow()}>Store policies</p>
          <nav aria-label="Store policies">
            {allPolicies.map((entry) => (
              <p key={entry.handle}>
                <Link
                  href={`/policies/${entry.handle}`}
                  aria-current={
                    entry.handle === policy.handle ? "page" : undefined
                  }
                >
                  {entry.title}
                </Link>
              </p>
            ))}
          </nav>
          {policy.updatedAt ? (
            <p className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase">
              Updated {formatDate(policy.updatedAt)}
            </p>
          ) : null}
        </aside>
        <div className="font-heading text-article-subheading leading-rich-copy">
          <p className="mb-prose-block max-w-lede text-lede leading-lede text-text-muted">
            {policy.summary}
          </p>
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mt-prose-section mb-prose-subhead text-balance text-article-heading leading-copy-tight font-medium">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={`${section.heading}:${richTextParagraphKey(paragraph)}`}
                  className="mb-prose-block"
                >
                  <RichTextParagraph paragraph={paragraph} />
                </p>
              ))}
            </section>
          ))}
          <p className="mb-prose-block text-text-muted">
            Questions about this policy? Visit the{" "}
            <Link href="/pages/contact">contact page</Link>.
          </p>
          {accountEnabled ? (
            <Link className={cta()} href="/account">
              Open the field account
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
