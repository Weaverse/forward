import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";

interface CollectionPageProps {
  params: Promise<{ collectionHandle: string }>;
}

export const dynamicParams = false;

/* Bounded catalog freshness — see the note on the product route. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const collections = await storefront.listCollections();
  return collections.map((collection) => ({
    collectionHandle: collection.handle,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collectionHandle } = await params;
  const collection = await storefront.getCollection(collectionHandle);
  if (collection === null) {
    return { title: "Collection not found" };
  }
  return {
    title: `${collection.title} · Shop`,
    description: collection.description,
  };
}

/** Collection content comes entirely from the normalized storefront model. */
export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionHandle } = await params;
  const [collection, products, themeContent, articles] = await Promise.all([
    storefront.getCollection(collectionHandle),
    storefront.getCollectionProducts(collectionHandle),
    storefront.getThemeContent(),
    storefront.listArticles(),
  ]);
  if (collection === null || products === null) {
    notFound();
  }
  const guideArticle = articles[0];

  return (
    <>
      <section className="relative mt-[22px] mr-7 ml-7 grid min-h-[82svh] grid-cols-[1.3fr_0.7fr] items-stretch overflow-hidden bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden max-md:min-h-[54svh]">
          <Image
            className="absolute inset-0 h-full object-cover object-center saturate-[0.75] contrast-[1.05]"
            src={collection.heroImage.src}
            alt={collection.heroImage.alt}
            width={collection.heroImage.width}
            height={collection.heroImage.height}
            sizes="(min-width: 820px) 65vw, 100vw"
            priority
          />
        </div>
        <div className="relative z-[2] flex flex-col justify-center bg-ink p-[clamp(45px,5vw,80px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-[58px]">
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-accent-warm tracking-field-meta uppercase">
            Movement system / {collection.fieldCode}
          </p>
          <h1 className="m-0 max-w-[620px] text-balance font-heading text-[clamp(62px,6.8vw,108px)] leading-[0.98] font-medium tracking-heading max-md:text-[clamp(54px,12vw,82px)]">
            {collection.title}
          </h1>
          <p className="mt-6 mb-8 max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-dark-subtle">
            {collection.description}
          </p>
          <Link
            className="inline-flex min-h-12 self-start items-center justify-center gap-2.5 border border-signal bg-signal px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
            href="/shop"
          >
            Shop the complete index
          </Link>
        </div>
      </section>

      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <div className="grid grid-cols-[0.8fr_1.2fr] items-center gap-[clamp(50px,10vw,150px)] max-md:grid-cols-1">
          <div className="translate-y-20 shadow-[30px_-30px_0_var(--color-signal)] max-md:translate-y-0 max-md:shadow-[14px_-14px_0_var(--color-signal)]">
            <Image
              className="aspect-4/5 object-cover"
              src={themeContent.standardBandImage.src}
              alt={themeContent.standardBandImage.alt}
              width={themeContent.standardBandImage.width}
              height={themeContent.standardBandImage.height}
              sizes="(min-width: 820px) 38vw, 100vw"
              loading="lazy"
            />
          </div>
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              The system
            </p>
            <h2 className="mb-7 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              Prepare for change, not every possibility.
            </h2>
            <p className="mb-[30px] max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
              Start with a layer that moves moisture, add warmth you can vent,
              and finish with a shell that packs small enough to bring every
              time. This kit is built to work as one system.
            </p>
            <ul className="my-8 list-none border-border-subtle border-t p-0">
              {products.map((product) => (
                <li
                  className="flex min-h-[58px] items-center justify-between border-border-subtle border-b font-body text-[9px] font-bold"
                  key={product.handle}
                >
                  <span>{product.title}</span>
                  <span>{product.category}</span>
                </li>
              ))}
            </ul>
            {guideArticle !== undefined ? (
              <Link
                className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
                href={`/journal/${guideArticle.handle}`}
              >
                Read the field note
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface-dark py-[clamp(70px,9vw,140px)] text-text-inverse">
        <div className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter">
          <div className="mb-11 flex items-end justify-between gap-[30px] max-sm:flex-col max-sm:items-start">
            <div>
              <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
                {collection.title} essentials
              </p>
              <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
                A focused kit for a full day out.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-text-inverse bg-transparent px-[22px] py-3 font-body text-[11px] font-bold tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-text-inverse)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:bg-text-inverse hover:text-ink hover:shadow-[2px_2px_0_var(--color-text-inverse)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-text-inverse focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
              href="/shop"
            >
              View all equipment
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <div className="grid grid-cols-[0.85fr_1.15fr] items-start gap-[clamp(48px,10vw,150px)] max-md:grid-cols-1">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Field practice / {collection.fieldCode}
            </p>
            <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              Let the route set the pace.
            </h2>
          </div>
          <div>
            <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
              Efficient movement is not about speed. It is about keeping effort
              even, noticing what changes, and reaching the last descent with
              enough attention left to enjoy it.
            </p>
            <Link
              className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
              href="/journal"
            >
              More field stories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
