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
      <header className="flex min-h-[560px] items-end border-border-subtle border-b bg-ink px-page-gutter pt-[100px] pb-[75px] text-text-inverse max-md:min-h-[520px] max-sm:min-h-[430px] max-sm:pt-[70px]">
        <div className="mx-auto grid w-full grid-cols-[1.35fr_0.65fr] items-end gap-[50px] max-md:grid-cols-[minmax(0,1fr)] max-md:gap-7">
          <div>
            <p className={eyebrow({ tone: "signal" })}>Support / Policy</p>
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
