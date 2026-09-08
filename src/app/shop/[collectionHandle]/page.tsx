import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { StorefrontDataProvider } from "@/lib/weaverse/data-context";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import CollectionGrid from "@/sections/collection-grid";
import CollectionHero from "@/sections/collection-hero";
import FieldPractice from "@/sections/field-practice";
import SystemManifest from "@/sections/system-manifest";

interface CollectionPageProps {
  params: Promise<{ collectionHandle: string }>;
  searchParams: Promise<SearchParams>;
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
 * Collection.
 *
 * `COLLECTION` is one template shared by every collection, so which collection
 * it renders is the route's decision, not a merchant's. The resource travels
 * to the sections through `dataContext`; the template only decides layout and
 * copy.
 *
 * Composition is optional: without a Weaverse page the route renders the same
 * sections from the theme's own defaults, so the credential-free storefront
 * keeps its catalog.
 */
export default async function CollectionPage(props: CollectionPageProps) {
  const { collectionHandle } = await props.params;
  const [collection, products, themeContent, articles, page, projectId] =
    await Promise.all([
      storefront.getCollection(collectionHandle),
      storefront.getCollectionProducts(collectionHandle),
      storefront.getThemeContent(),
      storefront.listArticles(),
      loadWeaversePage({
        handle: collectionHandle,
        pathname: `/shop/${collectionHandle}`,
        searchParams: await props.searchParams,
        type: "COLLECTION",
      }),
      Promise.resolve(weaverseProjectId()),
    ]);
  if (collection === null || products === null) {
    notFound();
  }
  const guideArticle = articles[0];

  if (page !== null && projectId !== null) {
    return (
      <WeaversePage
        data={page}
        dataContext={{ collection, collectionProducts: products }}
        projectId={projectId}
      />
    );
  }

  return (
    <StorefrontDataProvider
      value={{ collection, collectionProducts: products }}
    >
      <CollectionHero
        eyebrowPrefix="Movement system /"
        ctaLabel="Shop the complete index"
        ctaHref="/shop"
      />

      <SystemManifest
        eyebrowLabel="The system"
        heading="Prepare for change, not every possibility."
        body="Start with a layer that moves moisture, add warmth you can vent, and finish with a shell that packs small enough to bring every time. This kit is built to work as one system."
        image={themeContent.standardBandImage}
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
      />

      <FieldPractice
        eyebrowLabel={`Field practice / ${collection.fieldCode}`}
        heading="Let the route set the pace."
        body="Efficient movement is not about speed. It is about keeping effort even, noticing what changes, and reaching the last descent with enough attention left to enjoy it."
        linkLabel="More field stories"
        linkHref="/journal"
      />
    </StorefrontDataProvider>
  );
}
