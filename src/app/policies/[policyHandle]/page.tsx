import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate } from "@/lib/storefront/format";

interface PolicyPageProps {
  params: Promise<{ policyHandle: string }>;
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
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-12">
        <nav aria-label="Store policies" className="lg:col-span-3">
          <p className="field-label text-slate">Store policies</p>
          <ul className="mt-3 space-y-1 border-l border-mist">
            {allPolicies.map((entry) => {
              const selected = entry.handle === policy.handle;
              return (
                <li key={entry.handle}>
                  <Link
                    href={`/policies/${entry.handle}`}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "field-label -ml-px flex min-h-11 items-center border-l-2 px-4 transition-colors",
                      selected
                        ? "border-clay text-ink"
                        : "border-transparent text-slate hover:text-pine",
                    )}
                  >
                    {entry.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <article className="lg:col-span-9">
          <header className="border-b-2 border-pine pb-6">
            <p className="field-label text-clay">
              Policy record · updated {formatDate(policy.updatedAt)}
            </p>
            <h1 className="mt-3 font-display text-4xl text-pine sm:text-5xl">
              {policy.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
              {policy.summary}
            </p>
          </header>
          <div className="mt-8 space-y-8">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl text-pine">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="max-w-2xl text-base leading-relaxed text-ink/90"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <footer className="mt-10 border-t border-mist pt-5">
            <p className="text-xs leading-relaxed text-slate">
              Questions about this policy reach the field office at
              support@forward.example — a placeholder address for this static
              demo.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
