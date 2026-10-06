import { Link } from "@/components/link";

import {
  RichTextParagraph,
  richTextParagraphKey,
} from "@/components/rich-text-paragraph";
import type { LocaleId } from "@/lib/i18n/locales";
import type { ThemeTranslate } from "@/lib/i18n/static-content";
import { cta, eyebrow } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import type { Policy } from "@/lib/storefront/types";

interface PolicyDocumentProps {
  policy: Policy;
  locale: LocaleId;
  /** The page's translator, so the theme copy reads in the page's market. */
  t: ThemeTranslate;
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
  locale,
  t,
}: PolicyDocumentProps) {
  return (
    <article>
      <div className="mx-auto grid w-full max-w-page grid-cols-1 justify-center gap-article-gap px-page-gutter py-section-block-short md:grid-cols-article-body">
        <aside className="border-border-subtle border-b pb-5 text-caption text-text-muted md:border-b-0 md:pb-0">
          <p className={eyebrow()}>{t("policy.storePolicies")}</p>
          <nav aria-label={t("policy.storePolicies")}>
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
              {t("policy.updated", {
                date: formatDate(policy.updatedAt, locale),
              })}
            </p>
          ) : null}
        </aside>
        <div className="font-heading text-article-subheading leading-rich-copy">
          {policy.summary === "" ? null : (
            <p className="mb-prose-block max-w-lede text-lede leading-lede text-text-muted">
              {policy.summary}
            </p>
          )}
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
            {t("policy.questions")}{" "}
            <Link href="/pages/contact">{t("policy.contactPage")}</Link>.
          </p>
          {accountEnabled ? (
            <Link className={cta()} href="/account">
              {t("policy.openAccount")}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
