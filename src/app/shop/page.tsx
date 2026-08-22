import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
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
          <summary className="flex min-h-[52px] list-none items-center justify-between font-body text-[9px] font-medium tracking-[0.1em] uppercase after:text-lg after:font-normal after:content-['+'] group-open/filter:after:content-['−'] [&::-webkit-details-marker]:hidden">
            {group.heading}
          </summary>
          <div className="pb-[18px]">
            {group.links.map((link) => (
              <Link
                key={link.key}
                className="group/check flex min-h-10 items-center gap-2.5 font-body text-[9px] text-text-muted tracking-[0.08em] uppercase hover:text-ink aria-[current=page]:text-ink"
                href={link.href}
                aria-current={link.selected ? "page" : undefined}
              >
                <span
                  className="size-[13px] flex-none rounded-full border border-border-subtle group-aria-[current=page]/check:border-ink group-aria-[current=page]/check:bg-signal"
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
      <header className="flex min-h-[560px] items-end border-border-subtle border-b bg-ink px-page-gutter pt-[100px] pb-[75px] text-text-inverse max-md:min-h-[520px] max-sm:min-h-[430px] max-sm:pt-[70px]">
        <div className="mx-auto grid w-full grid-cols-[1.35fr_0.65fr] items-end gap-[50px] max-md:grid-cols-[minmax(0,1fr)] max-md:gap-7">
          <div>
            <p className="mb-7 font-field-meta text-[11px] font-medium text-signal tracking-field-meta uppercase">
              <Link href="/">Home</Link> / Shop
            </p>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal tracking-field-meta uppercase">
              Explore / All equipment
            </p>
            <h1 className="m-0 max-w-[1050px] text-balance font-heading text-display leading-[0.94] font-medium tracking-heading max-sm:text-[clamp(53px,17vw,80px)]">
              Field goods for moving outside.
            </h1>
          </div>
          <p className="m-0 max-w-[670px] justify-self-end text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-[#b5b8ae] max-md:max-w-full max-md:justify-self-start">
            A compact system of weather protection, carry, and footwear.
            Designed to work hard together and age well apart.
          </p>
        </div>
      </header>

      <div className="sticky top-header z-30 flex min-h-[72px] items-center justify-between border-ink border-y bg-signal px-page-gutter py-2 max-md:top-header-compact max-sm:flex-col max-sm:items-start max-sm:gap-2.5 max-sm:py-3">
        <div className="flex items-center gap-4 max-sm:w-full max-sm:justify-between">
          <span className="max-sm:text-[11px]" aria-live="polite">
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
            className="font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase"
            htmlFor="sort-products"
          >
            Sort
          </label>
          <select
            className="min-h-touch rounded-none border border-ink bg-transparent py-0 pr-[38px] pl-[14px] font-body text-[9px] font-bold uppercase max-sm:flex-1"
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
            className="min-h-touch border border-ink bg-transparent px-[14px] font-body text-[9px] font-extrabold tracking-[0.1em] uppercase hover:bg-surface-subtle"
            type="submit"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[190px_1fr] gap-9 px-page-gutter pt-[62px] pb-[100px] max-md:grid-cols-1">
        <FilterSidebar groups={filterGroups} idPrefix="desktop" />
        <section aria-label="Products">
          <h2 className="sr-only">Products</h2>
          {/* Mobile filters: the canonical drawer is a JS prototype, so
              Forward uses a no-JavaScript disclosure instead. */}
          <details className="group/disclosure mb-[26px] hidden border border-ink max-md:block">
            <summary className="flex min-h-12 list-none items-center justify-between px-4 font-body text-[9px] font-medium tracking-[0.1em] uppercase after:text-lg after:content-['+'] group-open/disclosure:after:content-['−'] [&::-webkit-details-marker]:hidden">
              Filters
            </summary>
            <FilterSidebar groups={filterGroups} idPrefix="mobile" />
          </details>
          {products.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-[18px] gap-y-14 max-lg:grid-cols-2 max-sm:gap-x-2.5 max-sm:gap-y-[35px]">
              {products.map((product, index) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center">
              <div className="max-w-[500px]">
                <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
                  No matching products
                </p>
                <h2 className="mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
                  Nothing in this drawer.
                </h2>
                <p className="text-text-muted">
                  No products match this filter. The full catalog is nine
                  products deep — try widening the view.
                </p>
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
                  href="/shop"
                >
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
