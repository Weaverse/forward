import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import {
  cta,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
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
      <section className="relative mt-5.5 mr-7 ml-7 grid min-h-page-min grid-cols-[1.3fr_0.7fr] items-stretch overflow-hidden bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
          <Image
            className="absolute inset-0 h-full object-cover object-center saturate-75 contrast-105"
            src={collection.heroImage.src}
            alt={collection.heroImage.alt}
            width={collection.heroImage.width}
            height={collection.heroImage.height}
            sizes="(min-width: 820px) 65vw, 100vw"
            priority
          />
        </div>
        <div className="relative z-2 flex flex-col justify-center bg-ink p-panel max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
          <p className={eyebrow({ tone: "warm" })}>
            Movement system / {collection.fieldCode}
          </p>
          <h1 className="m-0 max-w-155 text-balance font-heading text-collection-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile">
            {collection.title}
          </h1>
          <p className="mt-6 mb-8 max-w-lede text-lede leading-lede text-text-dark-subtle">
            {collection.description}
          </p>
          <Link
            className={cn(cta({ intent: "signal" }), "self-start")}
            href="/shop"
          >
            Shop the complete index
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <div className="grid grid-cols-[0.8fr_1.2fr] items-center gap-[clamp(50px,10vw,150px)] max-md:grid-cols-1">
          <div className="translate-y-20 shadow-collection-feature max-md:translate-y-0 max-md:shadow-collection-feature-mobile">
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
            <p className={eyebrow()}>The system</p>
            <h2 className="mb-7 text-balance font-heading text-heading-2 leading-heading font-medium tracking-heading">
              Prepare for change, not every possibility.
            </h2>
            <p className="mb-7.5 max-w-lede text-lede leading-lede text-text-muted">
              Start with a layer that moves moisture, add warmth you can vent,
              and finish with a shell that packs small enough to bring every
              time. This kit is built to work as one system.
            </p>
            <ul className="my-8 list-none border-border-subtle border-t p-0">
              {products.map((product) => (
                <li
                  className="flex min-h-14.5 items-center justify-between border-border-subtle border-b font-body text-micro font-bold"
                  key={product.handle}
                >
                  <span>{product.title}</span>
                  <span>{product.category}</span>
                </li>
              ))}
            </ul>
            {guideArticle !== undefined ? (
              <Link
                className={textLink()}
                href={`/journal/${guideArticle.handle}`}
              >
                Read the field note
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface-dark py-section-block text-text-inverse">
        <div className="mx-auto w-full max-w-page px-page-gutter">
          <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
            <div>
              <p className={eyebrow()}>{collection.title} essentials</p>
              <h2 className={sectionHeading()}>
                A focused kit for a full day out.
              </h2>
            </div>
            <Link className={cta({ intent: "light" })} href="/shop">
              View all equipment
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <div className="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1">
          <div>
            <p className={eyebrow()}>Field practice / {collection.fieldCode}</p>
            <h2 className={sectionHeading()}>Let the route set the pace.</h2>
          </div>
          <div>
            <p className="max-w-lede text-lede leading-lede text-text-muted">
              Efficient movement is not about speed. It is about keeping effort
              even, noticing what changes, and reaching the last descent with
              enough attention left to enjoy it.
            </p>
            <Link className={textLink()} href="/journal">
              More field stories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
