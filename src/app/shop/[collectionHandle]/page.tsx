import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

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
 */
export default async function CollectionPage(props: CollectionPageProps) {
  const { collectionHandle } = await props.params;
  const [collection, products, page, projectId] = await Promise.all([
    storefront.getCollection(collectionHandle),
    storefront.getCollectionProducts(collectionHandle),
    loadWeaversePage({
      handle: collectionHandle,
      pathname: `/shop/${collectionHandle}`,
      searchParams: await props.searchParams,
      type: "COLLECTION",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (
    collection === null ||
    products === null ||
    page === null ||
    projectId === null
  ) {
    notFound();
  }

  return (
    <WeaversePage
      data={page}
      dataContext={{ collection, collectionProducts: products }}
      projectId={projectId}
    />
  );
}
