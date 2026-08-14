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

/**
 * Collection landing — port of the canonical `activityPage()` (source
 * `app.js:265–273`): split image/dark-copy activity hero, the shifted guide
 * image with its signal shadow, a field-system product section, and the
 * closing field-practice grid.
 *
 * Title, copy, hero image, kit rows, and products all come from the
 * normalized collection model.
 */
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
      <section className="activity-hero">
        <div className="activity-hero-media">
          <Image
            src={collection.heroImage.src}
            alt={collection.heroImage.alt}
            width={collection.heroImage.width}
            height={collection.heroImage.height}
            sizes="(min-width: 820px) 65vw, 100vw"
            priority
          />
        </div>
        <div className="activity-hero-content">
          <p className="eyebrow">Movement system / {collection.fieldCode}</p>
          <h1 className="display">{collection.title}</h1>
          <p className="lede">{collection.description}</p>
          <Link className="button button-signal" href="/shop">
            Shop the complete index
          </Link>
        </div>
      </section>

      <section className="section shell">
        <div className="activity-guide">
          <div>
            <Image
              src={themeContent.standardBandImage.src}
              alt={themeContent.standardBandImage.alt}
              width={themeContent.standardBandImage.width}
              height={themeContent.standardBandImage.height}
              sizes="(min-width: 820px) 38vw, 100vw"
              loading="lazy"
            />
          </div>
          <div className="activity-guide-copy">
            <p className="eyebrow">The system</p>
            <h2 className="h2">Prepare for change, not every possibility.</h2>
            <p className="lede">
              Start with a layer that moves moisture, add warmth you can vent,
              and finish with a shell that packs small enough to bring every
              time. This kit is built to work as one system.
            </p>
            <ul className="kit-list">
              {products.map((product) => (
                <li key={product.handle}>
                  <span>{product.title}</span>
                  <span>{product.category}</span>
                </li>
              ))}
            </ul>
            {guideArticle !== undefined ? (
              <Link
                className="text-link"
                href={`/journal/${guideArticle.handle}`}
              >
                Read the field note
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section field-notes">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">{collection.title} essentials</p>
              <h2 className="h2">A focused kit for a full day out.</h2>
            </div>
            <Link className="button button-light" href="/shop">
              View all equipment
            </Link>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="intro-grid">
          <div>
            <p className="eyebrow">Field practice / {collection.fieldCode}</p>
            <h2 className="h2">Let the route set the pace.</h2>
          </div>
          <div>
            <p className="lede">
              Efficient movement is not about speed. It is about keeping effort
              even, noticing what changes, and reaching the last descent with
              enough attention left to enjoy it.
            </p>
            <Link className="text-link" href="/journal">
              More field stories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
