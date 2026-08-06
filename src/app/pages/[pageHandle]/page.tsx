import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await storefront.listPages();
  return pages.map((page) => ({ pageHandle: page.handle }));
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
      {/* Split masthead: editorial image beside a carbon title panel. */}
      <header
        data-surface="dark"
        className="border-b border-carbon bg-carbon text-cream"
      >
        <div
          className={cn(
            "mx-auto max-w-7xl",
            page.heroImage !== undefined &&
              "grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
          )}
        >
          {page.heroImage !== undefined ? (
            <Image
              src={page.heroImage.src}
              alt={page.heroImage.alt}
              width={page.heroImage.width}
              height={page.heroImage.height}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-full max-h-[24rem] w-full object-cover lg:max-h-none"
            />
          ) : null}
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:py-20">
            <p className="field-label text-acid">{page.eyebrow}</p>
            <h1 className="display-huge mt-5">{page.title}</h1>
          </div>
        </div>
      </header>

      {/* Premise band: mono label beside the oversized intro. */}
      <section className="border-b border-carbon/20">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-12">
          <p className="field-label text-clay lg:col-span-3">Brief</p>
          <p className="display-large max-w-3xl text-carbon lg:col-span-9">
            {page.intro}
          </p>
        </div>
      </section>

      {/* Numbered field-standard cards, staggered on desktop. */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {page.sections.map((section, index) => (
            <section
              key={section.heading}
              className={cn(
                "border border-carbon/30 px-6 py-8 sm:px-8",
                index % 2 === 1 && "lg:mt-12",
              )}
            >
              <p className="field-label text-pine">
                {String(index + 1).padStart(2, "0")} / Field standard
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-carbon sm:text-4xl">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="max-w-md text-sm leading-relaxed text-slate"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <footer className="mt-14 border-t border-carbon/30 pt-6">
          <Link
            href="/shop"
            className="field-label inline-flex min-h-11 items-center gap-2 bg-carbon px-6 text-cream transition-colors hover:bg-acid hover:text-carbon"
          >
            Shop the catalog →
          </Link>
        </footer>
      </div>
    </article>
  );
}
