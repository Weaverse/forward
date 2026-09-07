import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { CollectionGrid } from "@/sections/collection-grid";
import { CollectionHero } from "@/sections/collection-hero";
import { FieldPractice } from "@/sections/field-practice";
import { SystemManifest } from "@/sections/system-manifest";

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
      <CollectionHero
        eyebrowPrefix="Movement system /"
        ctaLabel="Shop the complete index"
        ctaHref="/shop"
        collection={collection}
      />

      <SystemManifest
        eyebrowLabel="The system"
        heading="Prepare for change, not every possibility."
        body="Start with a layer that moves moisture, add warmth you can vent, and finish with a shell that packs small enough to bring every time. This kit is built to work as one system."
        image={themeContent.standardBandImage}
        products={products}
        linkLabel="Read the field note"
        linkHref={
          guideArticle === undefined
            ? undefined
            : `/journal/${guideArticle.handle}`
        }
      />

      <CollectionGrid
        eyebrowLabel={`${collection.title} essentials`}
        heading="A focused kit for a full day out."
        ctaLabel="View all equipment"
        ctaHref="/shop"
        products={products}
      />

      <FieldPractice
        eyebrowLabel={`Field practice / ${collection.fieldCode}`}
        heading="Let the route set the pace."
        body="Efficient movement is not about speed. It is about keeping effort even, noticing what changes, and reaching the last descent with enough attention left to enjoy it."
        linkLabel="More field stories"
        linkHref="/journal"
      />
    </>
  );
}
