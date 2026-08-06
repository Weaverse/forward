import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/cn";
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

  return (
    <div>
      {/* Carbon policy masthead. */}
      <header
        data-surface="dark"
        className="border-b border-carbon bg-carbon text-cream"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end">
          <div>
            <p className="field-label text-acid">Support / Policy</p>
            <h1 className="display-huge mt-4">{policy.title}</h1>
          </div>
          <div className="max-w-sm">
            <p className="text-base leading-relaxed text-cream/75">
              {policy.summary}
            </p>
            <p className="field-label mt-4 text-cream/60">
              Policy record · updated {formatDate(policy.updatedAt)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <nav aria-label="Store policies" className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <p className="field-label text-pine">On this page</p>
              <ul className="mt-4">
                {allPolicies.map((entry) => {
                  const selected = entry.handle === policy.handle;
                  return (
                    <li
                      key={entry.handle}
                      className="border-t border-hairline last:border-b"
                    >
                      <Link
                        href={`/policies/${entry.handle}`}
                        aria-current={selected ? "page" : undefined}
                        className={cn(
                          "field-label flex min-h-11 items-center gap-3 transition-colors",
                          selected
                            ? "text-carbon"
                            : "text-slate hover:text-carbon",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2 rounded-full border border-carbon/40",
                            selected && "border-carbon bg-acid",
                          )}
                        />
                        {entry.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <article className="lg:col-span-9">
            <div className="space-y-12">
              {policy.sections.map((section, index) => (
                <section key={section.heading}>
                  <p className="field-label text-pine">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-carbon sm:text-4xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 32)}
                        className="max-w-2xl font-display text-lg leading-relaxed text-carbon/90"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <footer className="mt-12 border-t border-carbon/30 pt-5">
              <p className="field-label max-w-2xl normal-case tracking-normal text-slate">
                Questions about this policy reach the field office at
                support@forward.example — a placeholder address for this static
                demo.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
