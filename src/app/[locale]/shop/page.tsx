import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeLocale } from "@/lib/i18n/route-locale";

import { getStorefront } from "@/lib/storefront/data-source";
import {
  AFTER_PARAM,
  BEFORE_PARAM,
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

export const metadata: Metadata = {
  title: "Shop",
  description: "Every product this store publishes.",
};

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

/**
 * Shop — the whole catalog.
 *
 * Order and paging are query state the route validates before any product is
 * read; the composed `all-products` tree below is presentation over the page
 * the store returned. The Storefront API accepts no filters outside a
 * collection, so this route is sort and paging only — faceted browsing lives
 * on `/shop/<collectionHandle>`.
 */
export default async function ShopPage(props: ShopPageProps) {
  const locale = await routeLocale(props.params);
  const searchParams = await props.searchParams;
  const params = toSearchParams(searchParams);
  const sort = parseProductSort(params.get(SORT_PARAM));

  const [page, weaversePage, projectId] = await Promise.all([
    getStorefront(locale).getProductsPage({
      sort,
      after: params.get(AFTER_PARAM) ?? undefined,
      before: params.get(BEFORE_PARAM) ?? undefined,
    }),
    loadWeaversePage({
      locale,
      pathname: "/shop",
      searchParams,
      type: "ALL_PRODUCTS",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (weaversePage === null || projectId === null) {
    notFound();
  }

  return (
    <WeaversePage
      data={weaversePage}
      dataContext={{
        products: page.products,
        browse: { filters: page.filters, sort, pageInfo: page.pageInfo },
      }}
      projectId={projectId}
    />
  );
}
