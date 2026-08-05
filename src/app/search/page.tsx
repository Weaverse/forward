import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Forward catalog.",
};

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
      <header className="max-w-2xl">
        <p className="field-label text-clay">Index · full catalog</p>
        <h1 className="mt-3 font-display text-4xl text-pine sm:text-5xl">
          Search
        </h1>
      </header>

      {/* GET form: search works without JavaScript. */}
      <form method="get" action="/search" className="mt-8 max-w-xl">
        <label htmlFor="search-input" className="field-label text-ink">
          Search the store
        </label>
        <div className="mt-2 flex">
          <input
            id="search-input"
            type="search"
            name="q"
            defaultValue={rawQuery}
            placeholder="Try “shell”, “pack”, or “charcoal”"
            className="min-h-11 w-full border border-mist bg-bone px-4 text-base text-ink placeholder:text-slate/60"
          />
          <button
            type="submit"
            className="field-label inline-flex min-h-11 items-center border border-l-0 border-pine bg-pine px-6 text-bone transition-colors hover:bg-pine-deep"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-8">
        {!hasQuery ? (
          <div className="max-w-xl border-t border-mist pt-6">
            <p className="field-label text-slate">Common searches</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {["shell", "pack", "trail", "charcoal", "alpine"].map((term) => (
                <li key={term}>
                  <Link
                    href={`/search?q=${term}`}
                    className="field-label inline-flex min-h-11 items-center border border-mist px-4 text-slate transition-colors hover:border-pine hover:text-pine"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="field-label text-slate" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"} for
              “{query}”
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => (
                <ProductCard
                  key={product.handle}
                  product={product}
                  plate={product.plate}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-xl border border-mist bg-parchment px-6 py-10">
            <p className="font-display text-2xl text-pine">
              Nothing found for “{query}”
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              The catalog is three products deep, so search is unforgiving. Try
              a broader term like “shell”, “pack”, or a colorway such as
              “charcoal” — or browse everything at once.
            </p>
            <Link
              href="/shop"
              className="field-label mt-6 inline-flex min-h-11 items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
            >
              Browse the catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
