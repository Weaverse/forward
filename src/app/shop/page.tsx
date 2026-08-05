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
  sort: ProductSort,
): string {
  const params = new URLSearchParams();
  if (category !== undefined) {
    params.set("category", category);
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
  const filter: ProductListFilter = { category };
  const products = await storefront.listProducts(filter, sort);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <header className="max-w-2xl">
        <p className="field-label text-clay">Catalog · complete inventory</p>
        <h1 className="mt-3 font-display text-4xl text-pine sm:text-5xl">
          Shop
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate">
          A short list, on purpose. Every product here answers for its weight,
          its weather, and its repairability.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-y border-mist py-3">
        <nav aria-label="Filter by category">
          <ul className="flex flex-wrap items-center gap-1">
            {CATEGORY_FILTERS.map((entry) => {
              const selected = entry.value === category;
              return (
                <li key={entry.label}>
                  <Link
                    href={shopHref(entry.value, sort)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "field-label inline-flex min-h-11 items-center px-4 transition-colors",
                      selected
                        ? "bg-pine text-bone"
                        : "text-slate hover:text-pine",
                    )}
                  >
                    {entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* GET form: sorting works without JavaScript. */}
        <form method="get" action="/shop" className="flex items-center gap-2">
          {category !== undefined ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <label htmlFor="shop-sort" className="field-label text-slate">
            Sort
          </label>
          <select
            id="shop-sort"
            name="sort"
            defaultValue={sort}
            className="field-label min-h-11 border border-mist bg-bone px-3 text-ink"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="field-label inline-flex min-h-11 items-center border border-pine px-4 text-pine transition-colors hover:bg-pine hover:text-bone"
          >
            Apply
          </button>
        </form>
      </div>

      <p className="field-label mt-6 text-slate" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {category !== undefined ? ` · ${category}` : ""}
      </p>

      {products.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              plate={product.plate}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-mist bg-parchment px-6 py-12 text-center">
          <p className="font-display text-2xl text-pine">
            Nothing in this drawer
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate">
            No products match this filter. The full catalog is three products
            deep — try widening the view.
          </p>
          <Link
            href="/shop"
            className="field-label mt-6 inline-flex min-h-11 items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
          >
            View all products
          </Link>
        </div>
      )}
    </div>
  );
}
