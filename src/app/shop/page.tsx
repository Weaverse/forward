import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import type {
  ProductCategory,
  ProductListFilter,
  ProductSort,
} from "@/lib/storefront/types";

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

interface FilterLink {
  key: string;
  label: string;
  href: string;
  selected: boolean;
}

interface FilterGroup {
  heading: string;
  links: readonly FilterLink[];
}

/** Each filter row links to validated query state without requiring JavaScript. */
function FilterSidebar({
  groups,
  idPrefix,
}: {
  groups: readonly FilterGroup[];
  idPrefix: string;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle border-t",
        idPrefix === "desktop" && "max-md:hidden",
      )}
    >
      {groups.map((group) => (
        <details
          key={`${idPrefix}-${group.heading}`}
          className="group/filter border-border-subtle border-b"
          open
        >
          <summary className="flex min-h-13 list-none items-center justify-between font-body text-micro font-medium tracking-label uppercase after:text-lg after:font-normal after:content-['+'] group-open/filter:after:content-['−'] [&::-webkit-details-marker]:hidden">
            {group.heading}
          </summary>
          <div className="pb-4.5">
            {group.links.map((link) => (
              <Link
                key={link.key}
                className="group/check flex min-h-10 items-center gap-2.5 font-body text-micro text-text-muted tracking-control uppercase hover:text-ink aria-[current=page]:text-ink"
                href={link.href}
                aria-current={link.selected ? "page" : undefined}
              >
                <span
                  className="size-3.25 flex-none rounded-full border border-border-subtle group-aria-[current=page]/check:border-ink group-aria-[current=page]/check:bg-signal"
                  aria-hidden="true"
                />
                {link.label}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
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
      <header className="flex min-h-140 items-end border-border-subtle border-b bg-ink px-page-gutter pt-25 pb-18.75 text-text-inverse max-md:min-h-130 max-sm:min-h-107.5 max-sm:pt-17.5">
        <div className="mx-auto grid w-full grid-cols-page-header items-end gap-12.5 max-md:grid-cols-1 max-md:gap-7">
          <div>
            <p className="mb-7 font-field-meta text-ui font-medium text-signal tracking-field-meta uppercase">
              <Link href="/">Home</Link> / Shop
            </p>
            <p className={eyebrow({ tone: "signal" })}>
              Explore / All equipment
            </p>
            <h1 className="m-0 max-w-feature text-balance font-heading text-display leading-display font-medium tracking-heading max-sm:text-index-display-mobile">
              Field goods for moving outside.
            </h1>
          </div>
          <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
            A compact system of weather protection, carry, and footwear.
            Designed to work hard together and age well apart.
          </p>
        </div>
      </header>

      <div className="sticky top-header z-30 flex min-h-18 items-center justify-between border-ink border-y bg-signal px-page-gutter py-2 max-md:top-header-compact max-sm:flex-col max-sm:items-start max-sm:gap-2.5 max-sm:py-3">
        <div className="flex items-center gap-4 max-sm:w-full max-sm:justify-between">
          <span className="max-sm:text-ui" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
            {category !== undefined ? ` · ${category}` : ""}
            {activity !== undefined ? ` · ${activity}` : ""}
          </span>
        </div>
        {/* Sorting stays a plain GET form so it works without JavaScript. */}
        <form
          className="flex items-center gap-4 max-sm:w-full max-sm:justify-between"
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
            className="min-h-touch rounded-none border border-ink bg-transparent py-0 pr-9.5 pl-3.5 font-body text-micro font-bold uppercase max-sm:flex-1"
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

      <div className="mx-auto grid w-full max-w-page grid-cols-media-row gap-9 px-page-gutter pt-15.5 pb-25 max-md:grid-cols-1">
        <FilterSidebar groups={filterGroups} idPrefix="desktop" />
        <section aria-label="Products">
          <h2 className="sr-only">Products</h2>
          {/* Mobile filters: the canonical drawer is a JS prototype, so
              Forward uses a no-JavaScript disclosure instead. */}
          <details className="group/disclosure mb-6.5 hidden border border-ink max-md:block">
            <summary className="flex min-h-12 list-none items-center justify-between px-4 font-body text-micro font-medium tracking-label uppercase after:text-lg after:content-['+'] group-open/disclosure:after:content-['−'] [&::-webkit-details-marker]:hidden">
              Filters
            </summary>
            <FilterSidebar groups={filterGroups} idPrefix="mobile" />
          </details>
          {products.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-4.5 gap-y-14 max-lg:grid-cols-2 max-sm:gap-x-2.5 max-sm:gap-y-8.75">
              {products.map((product, index) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className={emptyState()}>
              <div className="max-w-form">
                <p className={eyebrow()}>No matching products</p>
                <h2 className={sectionHeading({ size: "subsectionSpaced" })}>
                  Nothing in this drawer.
                </h2>
                <p className="text-text-muted">
                  No products match this filter. The full catalog is nine
                  products deep — try widening the view.
                </p>
                <Link className={cta()} href="/shop">
                  View all products
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
