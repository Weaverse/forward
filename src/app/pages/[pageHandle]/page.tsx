import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";
import type { RichTextParagraph } from "@/lib/storefront/types";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

function paragraphKey(paragraph: RichTextParagraph): string {
  return paragraph.map((run) => `${run.href ?? "text"}:${run.text}`).join("|");
}

function PageParagraph({ paragraph }: { paragraph: RichTextParagraph }) {
  return (
    <>
      {paragraph.map((run) => {
        const key = `${run.href ?? "text"}:${run.text}`;
        return run.href?.startsWith("/") ? (
          <Link href={run.href} key={key}>
            {run.text}
          </Link>
        ) : run.href ? (
          <a href={run.href} key={key}>
            {run.text}
          </a>
        ) : (
          run.text
        );
      })}
    </>
  );
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

/** Rich-content surface shared by normalized Shopify pages. */
export default async function StorePageRoute({ params }: StorePageProps) {
  const { pageHandle } = await params;
  const [page, themeContent, collections] = await Promise.all([
    storefront.getPage(pageHandle),
    storefront.getThemeContent(),
    storefront.listCollections(),
  ]);
  if (page === null) {
    notFound();
  }
  const heroImage = page.heroImage ?? themeContent.standardBandImage;
  const originImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;
  const [premise, ...values] = page.sections;

  return (
    <>
      <section className="mt-[22px] mr-7 ml-7 grid min-h-[86svh] grid-cols-[1.15fr_0.85fr] place-items-stretch bg-ink text-left text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden max-md:min-h-[54svh]">
          <Image
            className="absolute inset-0 h-full object-cover object-[56%_center] saturate-[0.76]"
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
        </div>
        <div className="relative z-[2] flex flex-col justify-center bg-ink p-[clamp(45px,6vw,96px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-[58px]">
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-accent-warm tracking-field-meta uppercase">
            {page.eyebrow}
          </p>
          <h1 className="m-0 max-w-[650px] text-balance font-heading text-[clamp(60px,7vw,112px)] leading-[0.98] font-medium tracking-heading max-md:text-[clamp(54px,12vw,82px)]">
            {page.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <div className="grid grid-cols-[0.85fr_1.15fr] items-start gap-[clamp(48px,10vw,150px)] max-md:grid-cols-1">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Our premise
            </p>
            {premise !== undefined ? (
              <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
                {premise.heading}
              </h2>
            ) : null}
          </div>
          <div>
            <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
              {page.intro}
            </p>
            {premise?.paragraphs.map((paragraph) => (
              <p
                key={`${premise.heading}:${paragraphKey(paragraph)}`}
                className="text-text-muted"
              >
                <PageParagraph paragraph={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </section>

      {values.length > 0 ? (
        <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(42px,6vw,84px)]">
          <div className="grid grid-cols-12 gap-3 max-sm:grid-cols-1">
            {values.map((section, index) => (
              <article
                key={section.heading}
                className={cn(
                  "col-span-6 min-h-[330px] border border-ink bg-transparent p-[clamp(34px,5vw,70px)] max-sm:col-auto",
                  index % 2 === 1 &&
                    "translate-y-[70px] bg-surface-subtle max-sm:translate-y-0",
                )}
              >
                <span className="font-field-meta text-[11px] font-medium text-signal-strong tracking-field-meta">
                  {String(index + 1).padStart(2, "0")} / Field standard
                </span>
                <h2 className="mt-[50px] mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={`${section.heading}:${paragraphKey(paragraph)}`}
                    className="text-text-muted"
                  >
                    <PageParagraph paragraph={paragraph} />
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <div className="grid grid-cols-[0.75fr_1.25fr] items-start gap-20 max-md:grid-cols-1">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Where this goes
            </p>
            <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              A short catalog,
              <br />
              built slowly.
            </h2>
          </div>
          <div>
            <Image
              className="aspect-5/4 object-cover"
              src={originImage.src}
              alt={originImage.alt}
              width={originImage.width}
              height={originImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
              loading="lazy"
            />
            <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
              {themeContent.footerTagline}
            </p>
            <Link
              className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
              href="/shop"
            >
              Shop the catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
