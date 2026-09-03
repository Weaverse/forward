import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { cta, eyebrow } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate } from "@/lib/storefront/format";

interface PolicyPageProps {
  params: Promise<{ policyHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const policies = await storefront.listPolicies();
  return policies.map((policy) => ({ policyHandle: policy.handle }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { policyHandle } = await params;
  const policy = await storefront.getPolicy(policyHandle);
  if (policy === null) {
    return { title: "Policy not found" };
  }
  return { title: policy.title, description: policy.summary };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policyHandle } = await params;
  const [policy, allPolicies] = await Promise.all([
    storefront.getPolicy(policyHandle),
    storefront.listPolicies(),
  ]);
  if (policy === null) {
    notFound();
  }
  const accountEnabled = getCustomerAccountRuntime() !== null;

  return (
    <>
      <header className="flex min-h-140 items-end border-border-subtle border-b bg-ink px-page-gutter pt-25 pb-18.75 text-text-inverse max-md:min-h-130 max-sm:min-h-107.5 max-sm:pt-17.5">
        <div className="mx-auto grid w-full grid-cols-page-header items-end gap-12.5 max-md:grid-cols-1 max-md:gap-7">
          <div>
            <p className={eyebrow({ tone: "signal" })}>Support / Policy</p>
            <h1 className="m-0 max-w-feature text-balance font-heading text-display leading-display font-medium tracking-heading max-sm:text-index-display-mobile">
              {policy.title}
            </h1>
          </div>
          <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
            {policy.summary}
          </p>
        </div>
      </header>

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
                {section.paragraphs.map((paragraph) => {
                  const paragraphKey = paragraph
                    .map((run) => `${run.href ?? "text"}:${run.text}`)
                    .join("|");
                  return (
                    <p
                      key={`${section.heading}:${paragraphKey}`}
                      className="mb-prose-block"
                    >
                      {paragraph.map((run) => {
                        const runKey = `${run.href ?? "text"}:${run.text}`;
                        return run.href?.startsWith("/") ? (
                          <Link href={run.href} key={runKey}>
                            {run.text}
                          </Link>
                        ) : run.href ? (
                          <a href={run.href} key={runKey}>
                            {run.text}
                          </a>
                        ) : (
                          run.text
                        );
                      })}
                    </p>
                  );
                })}
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
    </>
  );
}
