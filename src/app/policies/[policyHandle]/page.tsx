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
      <header className="flex min-h-[560px] items-end border-border-subtle border-b bg-ink px-page-gutter pt-[100px] pb-[75px] text-text-inverse max-md:min-h-[520px] max-sm:min-h-[430px] max-sm:pt-[70px]">
        <div className="mx-auto grid w-full grid-cols-[1.35fr_0.65fr] items-end gap-[50px] max-md:grid-cols-[minmax(0,1fr)] max-md:gap-7">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal tracking-field-meta uppercase">
              Support / Policy
            </p>
            <h1 className="m-0 max-w-[1050px] text-balance font-heading text-display leading-[0.94] font-medium tracking-heading max-sm:text-[clamp(53px,17vw,80px)]">
              {policy.title}
            </h1>
          </div>
          <p className="m-0 max-w-[670px] justify-self-end text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-[#b5b8ae] max-md:max-w-full max-md:justify-self-start">
            {policy.summary}
          </p>
        </div>
      </header>

      <article>
        <div className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[180px_minmax(0,720px)] justify-center gap-[clamp(40px,8vw,120px)] px-page-gutter py-[clamp(70px,9vw,130px)] max-md:grid-cols-1">
          <aside className="text-[12px] text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Store policies
            </p>
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
              <p className="font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase">
                Updated {formatDate(policy.updatedAt)}
              </p>
            ) : null}
          </aside>
          <div className="font-heading text-[clamp(21px,2vw,27px)] leading-[1.7]">
            <p className="mb-[1.4em] max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
              {policy.summary}
            </p>
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mt-[2.5em] mb-[0.8em] text-balance text-[clamp(34px,4vw,52px)] leading-[1.05] font-medium">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => {
                  const paragraphKey = paragraph
                    .map((run) => `${run.href ?? "text"}:${run.text}`)
                    .join("|");
                  return (
                    <p
                      key={`${section.heading}:${paragraphKey}`}
                      className="mb-[1.4em]"
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
            <p className="mb-[1.4em] text-text-muted">
              Questions about this policy? Visit the{" "}
              <Link href="/pages/contact">contact page</Link>.
            </p>
            {accountEnabled ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
                href="/account"
              >
                Open the field account
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}
