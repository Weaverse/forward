import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Forward catalog.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Plain GET search backed by the normalized server-side catalog. */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const results =
    query.length > 0 ? await storefront.searchProducts(query) : [];
  const hasQuery = query.length > 0;

  return (
    <div className="mx-auto w-full max-w-page px-page-gutter pt-26.25 pb-section-block-bottom">
      <p className={eyebrow()}>Search the field catalog</p>
      <h1 className={sectionHeading({ size: "display" })}>
        What are you looking for?
      </h1>
      <form
        className="mt-17.5 mb-15 grid grid-cols-lead-trailing border-ink border-b-3 max-sm:grid-cols-1"
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
          className="h-27.5 min-w-0 border-0 bg-transparent font-heading text-search-display focus:outline-0 max-sm:h-16"
          defaultValue={rawQuery}
          placeholder="Try “trail”, “shell”, or “camp”"
        />
        <button
          className="min-w-25 bg-transparent font-body text-caption font-extrabold tracking-label uppercase max-sm:min-h-12 max-sm:justify-self-start"
          type="submit"
        >
          Search →
        </button>
      </form>

      {!hasQuery ? (
        <section className={emptyState()}>
          <div className="max-w-form">
            <p className={eyebrow()}>Start here</p>
            <h2 className={sectionHeading({ size: "subsectionSpaced" })}>
              Search by product, activity, or material.
            </h2>
            <p className="text-text-muted">
              Try trail, alpine, shell, pack, camp, or charcoal.
            </p>
            <Link className={cta()} href="/shop">
              Browse all gear
            </Link>
          </div>
        </section>
      ) : results.length > 0 ? (
        <section aria-label="Search results">
          <div className="mb-7.5 flex justify-between gap-5">
            <h2 className={sectionHeading({ size: "subsection" })}>
              Results for “{query}”
            </h2>
            <span
              className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase"
              aria-live="polite"
            >
              {results.length} found
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
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
        <section className={emptyState()}>
          <div className="max-w-form">
            <p className={eyebrow()}>No exact match</p>
            <h2 className={sectionHeading({ size: "subsectionSpaced" })}>
              Nothing turned up for “{query}”.
            </h2>
            <p className="text-text-muted" aria-live="polite">
              0 found. Try a broader term, or explore the full field system.
            </p>
            <Link className={cta()} href="/shop">
              View all gear
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
