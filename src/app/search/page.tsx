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
    <div className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter pt-[105px] pb-[clamp(56px,8vw,110px)]">
      <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
        Search the field catalog
      </p>
      <h1 className="m-0 text-balance font-heading text-display leading-[0.94] font-medium tracking-heading">
        What are you looking for?
      </h1>
      <form
        className="mt-[70px] mb-[60px] grid grid-cols-[1fr_auto] border-ink border-b-[3px] max-sm:grid-cols-1"
        method="get"
        action="/search"
      >
        <label className="sr-only" htmlFor="search-input">
          Search products
        </label>
        <input
          id="search-input"
          name="q"
          type="search"
          className="h-[110px] min-w-0 border-0 bg-transparent font-heading text-[clamp(45px,7vw,100px)] focus:outline-0 max-sm:h-16"
          defaultValue={rawQuery}
          placeholder="Try “trail”, “shell”, or “camp”"
        />
        <button
          className="min-w-[100px] bg-transparent font-body text-[12px] font-extrabold tracking-[0.1em] uppercase max-sm:min-h-12 max-sm:justify-self-start"
          type="submit"
        >
          Search →
        </button>
      </form>

      {!hasQuery ? (
        <section className="grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center">
          <div className="max-w-[500px]">
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Start here
            </p>
            <h2 className="mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
              Search by product, activity, or material.
            </h2>
            <p className="text-text-muted">
              Try trail, alpine, shell, pack, camp, or charcoal.
            </p>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
              href="/shop"
            >
              Browse all gear
            </Link>
          </div>
        </section>
      ) : results.length > 0 ? (
        <section aria-label="Search results">
          <div className="mb-[30px] flex justify-between gap-5">
            <h2 className="m-0 text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
              Results for “{query}”
            </h2>
            <span
              className="font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase"
              aria-live="polite"
            >
              {results.length} found
            </span>
          </div>
          <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
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
        <section className="grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center">
          <div className="max-w-[500px]">
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              No exact match
            </p>
            <h2 className="mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
              Nothing turned up for “{query}”.
            </h2>
            <p className="text-text-muted" aria-live="polite">
              0 found. Try a broader term, or explore the full field system.
            </p>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
              href="/shop"
            >
              View all gear
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
