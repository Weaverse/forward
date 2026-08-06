import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
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

/**
 * Canonical `.filter-sidebar` hierarchy (source `app.js:109–139`). The
 * canonical prototype mutates global state from radio/checkbox inputs; Forward
 * keeps its no-JavaScript query contract, so each row is a link carrying the
 * validated `activity`/`category`/`sort` parameters.
 */
function FilterSidebar({
  groups,
  idPrefix,
}: {
  groups: readonly FilterGroup[];
  idPrefix: string;
}) {
  return (
    <div className="filter-sidebar">
      {groups.map((group) => (
        <details
          key={`${idPrefix}-${group.heading}`}
          className="filter-group"
          open
        >
          <summary>{group.heading}</summary>
          <div className="filter-options">
            {group.links.map((link) => (
              <Link
                key={link.key}
                className="check-row"
                href={link.href}
                aria-current={link.selected ? "page" : undefined}
              >
                <span className="check-dot" aria-hidden="true" />
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

/**
 * Shop / PLP — port of the canonical `shopPage()` (source `app.js:252–263`):
 * dark page hero, signal count/sort rail, filter sidebar, and the 12-column
 * asymmetric grid whose cadence lives in the `.plp-grid` nth-child rules.
 */
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
      <header className="page-hero">
        <div className="page-hero-inner">
          <div>
            <p className="breadcrumbs">
              <Link href="/">Home</Link> / Shop
            </p>
            <p className="eyebrow">Explore / All equipment</p>
            <h1 className="h1">Field goods for moving outside.</h1>
          </div>
          <p className="lede">
            A compact system of weather protection, carry, and footwear.
            Designed to work hard together and age well apart.
          </p>
        </div>
      </header>

      <div className="collection-tools">
        <div className="collection-tools-left">
          <span className="result-copy" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
            {category !== undefined ? ` · ${category}` : ""}
            {activity !== undefined ? ` · ${activity}` : ""}
          </span>
        </div>
        {/* Sorting stays a plain GET form so it works without JavaScript. */}
        <form className="collection-tools-right" method="get" action="/shop">
          {category !== undefined ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          {activity !== undefined ? (
            <input type="hidden" name="activity" value={activity} />
          ) : null}
          <label className="meta" htmlFor="sort-products">
            Sort
          </label>
          <select
            className="sort-select"
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
          <button className="tool-button" type="submit">
            Apply
          </button>
        </form>
      </div>

      <div className="shell plp-layout">
        <FilterSidebar groups={filterGroups} idPrefix="desktop" />
        <section aria-label="Products">
          {/* Mobile filters: the canonical drawer is a JS prototype, so
              Forward uses a no-JavaScript disclosure instead. */}
          <details className="filter-disclosure">
            <summary>Filters</summary>
            <FilterSidebar groups={filterGroups} idPrefix="mobile" />
          </details>
          {products.length > 0 ? (
            <div className="plp-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-inner">
                <p className="eyebrow">No matching plates</p>
                <h2 className="h3">Nothing in this drawer.</h2>
                <p className="muted">
                  No products match this filter. The full catalog is three
                  products deep — try widening the view.
                </p>
                <Link className="button button-primary" href="/shop">
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
