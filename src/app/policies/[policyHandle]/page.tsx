import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
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

/**
 * Policy — port of the canonical `policyPage()` (source `app.js:324`): dark
 * page hero, the route-note aside, the editorial article measure with its
 * heading rhythm, and the closing call to action.
 */
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
      <header className="page-hero">
        <div className="page-hero-inner">
          <div>
            <p className="eyebrow">Support / Policy</p>
            <h1 className="h1">{policy.title}</h1>
          </div>
          <p className="lede">{policy.summary}</p>
        </div>
      </header>

      <article>
        <div className="shell article-body">
          <aside className="article-aside">
            <p className="eyebrow">Store policies</p>
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
              <p className="meta">Updated {formatDate(policy.updatedAt)}</p>
            ) : null}
          </aside>
          <div className="article-content">
            <p className="lede">{policy.summary}</p>
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => {
                  const paragraphKey = paragraph
                    .map((run) => `${run.href ?? "text"}:${run.text}`)
                    .join("|");
                  return (
                    <p key={`${section.heading}:${paragraphKey}`}>
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
            <p className="muted">
              Questions about this policy? Visit the{" "}
              <Link href="/pages/contact">contact page</Link>.
            </p>
            {accountEnabled ? (
              <Link className="button button-primary" href="/account">
                Open the field account
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}
