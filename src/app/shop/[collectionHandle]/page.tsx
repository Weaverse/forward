import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { storefront } from "@/lib/storefront/data-source";
import {
  AFTER_PARAM,
  BEFORE_PARAM,
  parseFilterParams,
  SORT_PARAM,
  toSearchParams,
} from "@/lib/storefront/filter-params";
import { parseProductSort } from "@/lib/storefront/sort";
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
 *
 * Filter and sort are the route's decision too. They are query state — shared,
 * bookmarked, and untrusted until validated — and they select which products
 * are read, so they are resolved here and handed down already narrowed. The
 * `main-collection` tree below is presentation over that result.
 */
export default async function CollectionPage(props: CollectionPageProps) {
  const { collectionHandle } = await props.params;
  const searchParams = await props.searchParams;
  const params = toSearchParams(searchParams);
  const pathname = `/shop/${collectionHandle}`;
  const sort = parseProductSort(params.get(SORT_PARAM));

  const [collection, page, weaversePage, projectId] = await Promise.all([
    storefront.getCollection(collectionHandle),
    /* The store narrows, orders and pages. Facet shapes travel from the URL
     * into the query untouched, so a filter the merchant enabled after this
     * code shipped still works. */
    storefront.getCollectionPage(collectionHandle, {
      filters: parseFilterParams(params),
      sort,
      after: params.get(AFTER_PARAM) ?? undefined,
      before: params.get(BEFORE_PARAM) ?? undefined,
    }),
    loadWeaversePage({
      handle: collectionHandle,
      pathname,
      searchParams,
      type: "COLLECTION",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (
    collection === null ||
    page === null ||
    weaversePage === null ||
    projectId === null
  ) {
    notFound();
  }

  return (
    <WeaversePage
      data={weaversePage}
      dataContext={{
        collection,
        collectionProducts: page.products,
        browse: { filters: page.filters, sort, pageInfo: page.pageInfo },
      }}
      projectId={projectId}
    />
  );
}
