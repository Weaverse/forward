import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marketAlternates } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator } from "@/lib/i18n/translator";
import { getStorefront } from "@/lib/storefront/data-source";
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
  params: Promise<{ locale: string; collectionHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

/* Bounded catalog freshness — see the note on the product route. */
export const revalidate = 3600;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = parseLocale(params.locale) ?? DEFAULT_LOCALE;
  const collections = await getStorefront(locale).listCollections();
  return collections.map((collection) => ({
    collectionHandle: collection.handle,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale: segment, collectionHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const collection =
    await getStorefront(locale).getCollection(collectionHandle);
  const t = await getTranslator(locale);
  if (collection === null) {
    return { title: t("meta.collectionNotFound") };
  }
  return {
    title: t("meta.collectionTitle", { title: collection.title }),
    description: collection.description,
    alternates: marketAlternates(`/shop/${collectionHandle}`, locale),
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
  const locale = await routeLocale(props.params);
  const searchParams = await props.searchParams;
  const params = toSearchParams(searchParams);
  const pathname = `/shop/${collectionHandle}`;
  const sort = parseProductSort(params.get(SORT_PARAM));

  const [collection, page, weaversePage, projectId] = await Promise.all([
    getStorefront(locale).getCollection(collectionHandle),
    /* The store narrows, orders and pages. Facet shapes travel from the URL
     * into the query untouched, so a filter the merchant enabled after this
     * code shipped still works. */
    getStorefront(locale).getCollectionPage(collectionHandle, {
      filters: parseFilterParams(params),
      sort,
      after: params.get(AFTER_PARAM) ?? undefined,
      before: params.get(BEFORE_PARAM) ?? undefined,
    }),
    loadWeaversePage({
      locale,
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
