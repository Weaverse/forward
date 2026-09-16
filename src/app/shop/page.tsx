import type { Metadata } from "next";
import Link from "next/link";

import type { FilterGroup } from "@/components/filter-sidebar";
import { FilterSidebar } from "@/components/filter-sidebar";
import { storefront } from "@/lib/storefront/data-source";
import type {
  ProductCategory,
  ProductListFilter,
  ProductSort,
} from "@/lib/storefront/types";
import { IndexHeader } from "@/sections/index-header";
import { ProductResults } from "@/sections/product-results";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "The complete Forward catalog: Weatherline Shell, Ridge 30 Field Pack, and Talus Trail Shoe.",
};

const CATEGORY_FILTERS: ReadonlyArray<{
  value: ProductCategory | undefined;
  label: string;
}> = [
  { value: undefined, label: "All categories" },
  { value: "shells", label: "Shells" },
  { value: "packs", label: "Packs" },
  { value: "footwear", label: "Footwear" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: ProductSort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price low–high" },
  { value: "price-desc", label: "Price high–low" },
  { value: "name", label: "Name A–Z" },
];

function parseCategory(value: string | undefined): ProductCategory | undefined {
  return value === "shells" || value === "packs" || value === "footwear"
    ? value
    : undefined;
}

function parseSort(value: string | undefined): ProductSort {
  return value === "price-asc" || value === "price-desc" || value === "name"
    ? value
    : "featured";
}

function shopHref(
  category: ProductCategory | undefined,
  activity: string | undefined,
  sort: ProductSort,
): string {
  const params = new URLSearchParams();
  if (category !== undefined) {
    params.set("category", category);
  }
  if (activity !== undefined) {
    params.set("activity", activity);
  }
  if (sort !== "featured") {
    params.set("sort", sort);
  }
  const query = params.toString();
  return query.length > 0 ? `/shop?${query}` : "/shop";
}

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = parseCategory(
    typeof params.category === "string" ? params.category : undefined,
  );
  const sort = parseSort(
    typeof params.sort === "string" ? params.sort : undefined,
  );
  const catalog = await storefront.listProducts();
  const activities = [
    ...new Set(catalog.flatMap((product) => product.activities)),
  ];
  const requestedActivity =
    typeof params.activity === "string" ? params.activity : undefined;
  const activity = activities.includes(requestedActivity ?? "")
    ? requestedActivity
    : undefined;
  const filter: ProductListFilter = { category, activity };
  const products = await storefront.listProducts(filter, sort);

  const filterGroups: readonly FilterGroup[] = [
    {
      heading: "Activity",
      links: [
        {
          key: "all-activities",
          label: "All activities",
          href: shopHref(category, undefined, sort),
          selected: activity === undefined,
        },
        ...activities.map((entry) => ({
          key: entry,
          label: entry,
          href: shopHref(category, entry, sort),
          selected: entry === activity,
        })),
      ],
    },
    {
      heading: "Category",
      links: CATEGORY_FILTERS.map((entry) => ({
        key: entry.label,
        label: entry.label,
        href: shopHref(entry.value, activity, sort),
        selected: entry.value === category,
      })),
    },
  ];

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
            {category !== undefined ? ` · ${category}` : ""}
            {activity !== undefined ? ` · ${activity}` : ""}
          </span>
        </div>
        {/* Sorting stays a plain GET form so it works without JavaScript. */}
        <form
          className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start"
          method="get"
          action="/shop"
        >
          {category !== undefined ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          {activity !== undefined ? (
            <input type="hidden" name="activity" value={activity} />
          ) : null}
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
