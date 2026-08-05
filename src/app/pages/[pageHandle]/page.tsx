import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { pageHandle } = await params;
  const page = await storefront.getPage(pageHandle);
  if (page === null) {
    return { title: "Page not found" };
  }
  return { title: page.title, description: page.intro };
}

export default async function StorePageRoute({ params }: StorePageProps) {
  const { pageHandle } = await params;
  const page = await storefront.getPage(pageHandle);
  if (page === null) {
    notFound();
  }

  return (
    <article>
      <header className="border-b border-mist bg-parchment">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <p className="field-label text-clay">{page.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-pine sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
            {page.intro}
          </p>
        </div>
      </header>

      {page.heroImage !== undefined ? (
        <Image
          src={page.heroImage.src}
          alt={page.heroImage.alt}
          width={page.heroImage.width}
          height={page.heroImage.height}
          priority
          sizes="100vw"
          className="max-h-[26rem] w-full border-b border-mist object-cover"
        />
      ) : null}

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="space-y-10">
          {page.sections.map((section, index) => (
            <section
              key={section.heading}
              className="grid gap-4 sm:grid-cols-12"
            >
              <p className="field-label pt-1 text-clay sm:col-span-3">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="sm:col-span-9">
                <h2 className="font-display text-2xl text-pine sm:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-base leading-relaxed text-ink/90"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        <footer className="mt-12 border-t border-mist pt-6">
          <Link
            href="/shop"
            className="field-label inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
          >
            Shop the catalog →
          </Link>
        </footer>
      </div>
    </article>
  );
}
