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
  { value: undefined, label: "All" },
  { value: "shells", label: "Shells" },
  { value: "packs", label: "Packs" },
  { value: "footwear", label: "Footwear" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: ProductSort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name", label: "Name, A–Z" },
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

  const filterGroups = [
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

  const filterNav = (
    <nav aria-label="Filter products" className="space-y-8">
      {filterGroups.map((group) => (
        <div key={group.heading}>
          <p className="field-label border-b border-carbon/20 pb-2 text-carbon">
            {group.heading}
          </p>
          <ul className="mt-3 space-y-1">
            {group.links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  aria-current={link.selected ? "page" : undefined}
                  className={cn(
                    "field-label inline-flex min-h-9 items-center gap-2 capitalize transition-colors",
                    link.selected
                      ? "text-carbon"
                      : "text-slate hover:text-carbon",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full border border-carbon/40",
                      link.selected && "bg-acid border-carbon",
                    )}
                  />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div>
      {/* Dark editorial masthead */}
      <section
        data-surface="dark"
        className="bg-carbon text-cream"
        aria-label="Shop masthead"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end">
          <div>
            <p className="field-label text-acid">Explore / All equipment</p>
            <h1 className="display-huge mt-4">Shop the complete catalog.</h1>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-cream/75">
            A short list, on purpose. Every product here answers for its weight,
            its weather, and its repairability.
          </p>
        </div>
      </section>

      {/* Acid inventory/sort rail — sorting stays a plain GET form. */}
      <div className="border-b border-carbon bg-acid">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-2 sm:px-8">
          <p className="field-label text-carbon" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
            {category !== undefined ? ` · ${category}` : ""}
            {activity !== undefined ? ` · ${activity}` : ""}
          </p>
          <form method="get" action="/shop" className="flex items-center gap-2">
            {category !== undefined ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {activity !== undefined ? (
              <input type="hidden" name="activity" value={activity} />
            ) : null}
            <label htmlFor="shop-sort" className="field-label text-carbon">
              Sort
            </label>
            <select
              id="shop-sort"
              name="sort"
              defaultValue={sort}
              className="field-label min-h-11 border border-carbon bg-cream px-3 text-carbon"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="field-label inline-flex min-h-11 items-center bg-carbon px-4 text-acid transition-colors hover:text-cream"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        {/* Mobile filter disclosure — no JavaScript required. */}
        <details className="mb-8 border border-carbon/30 lg:hidden">
          <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-carbon">
            Filters
            <span aria-hidden="true">+</span>
          </summary>
          <div className="border-t border-carbon/20 px-4 py-5">{filterNav}</div>
        </details>

        <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-10">
          <aside className="hidden lg:block">{filterNav}</aside>
          <div>
            {products.length > 0 ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.handle}
                    product={product}
                    plate={product.plate}
                    stagger={index % 3 === 1}
                    priority={index < 3}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-carbon/30 bg-parchment px-6 py-14 text-center">
                <p className="field-label text-clay">No matching plates</p>
                <p className="mt-3 font-display text-3xl text-carbon">
                  Nothing in this drawer.
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate">
                  No products match this filter. The full catalog is three
                  products deep — try widening the view.
                </p>
                <Link
                  href="/shop"
                  className="field-label mt-6 inline-flex min-h-11 items-center bg-carbon px-5 text-cream transition-colors hover:bg-acid hover:text-carbon"
                >
                  View all products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
