import type { Metadata } from "next";
import Link from "next/link";

import { FilterSidebar } from "@/components/filter-sidebar";
import {
  deriveFilterGroups,
  describeFilter,
  parseCatalogQuery,
  SORT_OPTIONS,
  toSearchParams,
} from "@/lib/storefront/catalog-facets";
import { storefront } from "@/lib/storefront/data-source";
import { IndexHeader } from "@/sections/index-header";
import { ProductResults } from "@/sections/product-results";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "The complete Forward catalog: Weatherline Shell, Ridge 30 Field Pack, and Talus Trail Shoe.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = toSearchParams(await searchParams);
  const catalog = await storefront.listProducts();
  const { filter, sort } = parseCatalogQuery(params, catalog);
  const products = await storefront.listProducts(filter, sort);
  const filterGroups = deriveFilterGroups({
    pathname: "/shop",
    params,
    products: catalog,
    filter,
  });

  return (
    <>
      <IndexHeader
        breadcrumb={
          <>
            <Link href="/">Home</Link> / Shop
          </>
        }
        eyebrowLabel="Explore / All equipment"
        heading="Field goods for moving outside."
        lede="A compact system of weather protection, carry, and footwear. Designed to work hard together and age well apart."
      />

      <div className="sticky top-header-compact z-30 flex min-h-18 flex-col items-start justify-between gap-2.5 border-ink border-y bg-signal px-page-gutter py-3 sm:flex-row sm:items-center sm:gap-0 sm:py-2 md:top-header">
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
          <span className="text-ui sm:text-copy-sm" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
            {describeFilter(filter)}
          </span>
        </div>
        {/* Sorting stays a plain GET form so it works without JavaScript. */}
        <form
          className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start"
          method="get"
          action="/shop"
        >
          {filter.category === undefined ? null : (
            <input type="hidden" name="category" value={filter.category} />
          )}
          {filter.activity === undefined ? null : (
            <input type="hidden" name="activity" value={filter.activity} />
          )}
          <label
            className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase"
            htmlFor="sort-products"
          >
            Sort
          </label>
          <select
            className="min-h-touch flex-1 rounded-none border border-ink bg-transparent py-0 pr-9.5 pl-3.5 font-body text-micro font-bold uppercase sm:flex-initial"
            id="sort-products"
            name="sort"
            defaultValue={sort}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="min-h-touch border border-ink bg-transparent px-3.5 font-body text-micro font-extrabold tracking-label uppercase hover:bg-surface-subtle"
            type="submit"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-9 px-page-gutter pt-15.5 pb-25 md:grid-cols-media-row">
        <FilterSidebar groups={filterGroups} idPrefix="desktop" />
        <ProductResults filterGroups={filterGroups} products={products} />
      </div>
    </>
  );
}
