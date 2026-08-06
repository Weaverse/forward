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

/**
 * Search — port of the canonical `searchPage()` (source `app.js:293–300`):
 * oversized search heading and input, the start state, the results head plus
 * canonical grid, and the no-match state.
 *
 * The query stays a plain GET so search works without JavaScript, and results
 * come from the normalized server-side search.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const results =
    query.length > 0 ? await storefront.searchProducts(query) : [];
  const hasQuery = query.length > 0;

  return (
    <div className="shell search-wrap">
      <p className="eyebrow">Search the field catalog</p>
      <h1 className="h1">What are you looking for?</h1>
      <form className="search-form" method="get" action="/search">
        <label className="sr-only" htmlFor="search-input">
          Search products
        </label>
        <input
          id="search-input"
          name="q"
          type="search"
          defaultValue={rawQuery}
          placeholder="Try “trail”, “shell”, or “camp”"
        />
        <button type="submit">Search →</button>
      </form>

      {!hasQuery ? (
        <section className="empty-state">
          <div className="empty-state-inner">
            <p className="eyebrow">Start here</p>
            <h2 className="h3">Search by product, activity, or material.</h2>
            <p className="muted">
              Try trail, alpine, shell, pack, camp, or charcoal.
            </p>
            <Link className="button button-primary" href="/shop">
              Browse all gear
            </Link>
          </div>
        </section>
      ) : results.length > 0 ? (
        <section aria-label="Search results">
          <div className="search-results-head">
            <h2 className="h3">Results for “{query}”</h2>
            <span className="meta" aria-live="polite">
              {results.length} found
            </span>
          </div>
          <div className="product-grid">
            {results.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state">
          <div className="empty-state-inner">
            <p className="eyebrow">No exact match</p>
            <h2 className="h3">Nothing turned up for “{query}”.</h2>
            <p className="muted" aria-live="polite">
              0 found. Try a broader term, or explore the full field system.
            </p>
            <Link className="button button-primary" href="/shop">
              View all gear
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
