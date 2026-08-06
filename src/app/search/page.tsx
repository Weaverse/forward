import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Forward catalog.",
};

const COMMON_SEARCHES = ["shell", "pack", "trail", "charcoal", "alpine"];

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const results =
    query.length > 0 ? await storefront.searchProducts(query) : [];
  const hasQuery = query.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <header>
        <p className="field-label text-clay">Search the field catalog</p>
        <h1 className="display-huge mt-6 text-carbon">
          What are you looking for?
        </h1>
      </header>

      {/* GET form: search works without JavaScript. */}
      <form method="get" action="/search" className="mt-10">
        <label htmlFor="search-input" className="sr-only">
          Search the store
        </label>
        <div className="flex items-end gap-6 border-b-2 border-carbon pb-3">
          <input
            id="search-input"
            type="search"
            name="q"
            defaultValue={rawQuery}
            placeholder="trail"
            className="display-large w-full min-w-0 bg-transparent text-carbon placeholder:text-carbon/30"
          />
          <button
            type="submit"
            className="field-label inline-flex min-h-11 shrink-0 items-center gap-2 text-carbon transition-colors hover:text-pine"
          >
            Search →
          </button>
        </div>
      </form>

      <div className="mt-12">
        {!hasQuery ? (
          <div>
            <p className="field-label text-slate">Common searches</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {COMMON_SEARCHES.map((term) => (
                <li key={term}>
                  <Link
                    href={`/search?q=${term}`}
                    className="field-label inline-flex min-h-11 items-center border border-carbon/40 px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display-large text-carbon">
                Results for “{query}”
              </h2>
              <p className="field-label text-slate" aria-live="polite">
                {results.length} found
              </p>
            </div>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product, index) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  plate={product.plate}
                  priority={index < 3}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display-large text-carbon">
                Nothing for “{query}”
              </h2>
              <p className="field-label text-slate" aria-live="polite">
                0 found
              </p>
            </div>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate">
              The catalog is three products deep, so search is unforgiving. Try
              a broader term or one of the common searches — or browse
              everything at once.
            </p>
            <ul className="mt-6 flex flex-wrap gap-3">
              {COMMON_SEARCHES.map((term) => (
                <li key={term}>
                  <Link
                    href={`/search?q=${term}`}
                    className="field-label inline-flex min-h-11 items-center border border-carbon/40 px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/shop"
              className="field-label mt-8 inline-flex min-h-11 items-center bg-carbon px-6 text-cream transition-colors hover:bg-acid hover:text-carbon"
            >
              Browse the catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
