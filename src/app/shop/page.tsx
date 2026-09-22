import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import {
  AFTER_PARAM,
  BEFORE_PARAM,
  SORT_PARAM,
  toSearchParams,
} from "@/lib/storefront/filter-params";
import { parseProductSort } from "@/lib/storefront/sort";
import { StorefrontDataProvider } from "@/lib/weaverse/data-context";
import { WeaversePage } from "@/lib/weaverse/page";
import { pageRenders } from "@/lib/weaverse/page-payload";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import AllProducts, { AllProductsHeader } from "@/sections/all-products";
import AllProductsGrid from "@/sections/all-products/product-grid";
import AllProductsToolbar from "@/sections/all-products/toolbar";

export const metadata: Metadata = {
  title: "Shop",
  description: "Every product this store publishes.",
};

interface ShopPageProps {
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
  const searchParams = await props.searchParams;
  const params = toSearchParams(searchParams);
  const sort = parseProductSort(params.get(SORT_PARAM));

  const [page, weaversePage, projectId] = await Promise.all([
    storefront.getProductsPage({
      sort,
      after: params.get(AFTER_PARAM) ?? undefined,
      before: params.get(BEFORE_PARAM) ?? undefined,
    }),
    loadWeaversePage({
      pathname: "/shop",
      searchParams,
      type: "ALL_PRODUCTS",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  const dataContext = {
    products: page.products,
    browse: { filters: page.filters, sort, pageInfo: page.pageInfo },
  };

  return (
    <>
      {/* The catalog is the one thing this URL cannot be without. It is a
       * section so Studio can compose and configure it, but a project with no
       * ALL_PRODUCTS template yet — or one a merchant removed the block from —
       * must not leave Shop empty. So the route renders it when the page does
       * not. */}
      {pageRenders(weaversePage, "all-products") ? null : (
        <StorefrontDataProvider value={dataContext}>
          <AllProductsHeader
            heading="All products"
            lede="Every product this store publishes."
          />
          <AllProducts>
            <AllProductsToolbar />
            <AllProductsGrid />
          </AllProducts>
        </StorefrontDataProvider>
      )}
      {weaversePage === null || projectId === null ? null : (
        <WeaversePage
          data={weaversePage}
          dataContext={dataContext}
          projectId={projectId}
        />
      )}
    </>
  );
}
