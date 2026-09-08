import type { Metadata } from "next";

import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import { SearchEmptyState } from "@/sections/search-empty-state";
import { SearchResults } from "@/sections/search-results";

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
        <SearchEmptyState
          eyebrowLabel="Start here"
          heading="Search by product, activity, or material."
          body="Try trail, alpine, shell, pack, camp, or charcoal."
          ctaLabel="Browse all gear"
          ctaHref="/shop"
        />
      ) : results.length > 0 ? (
        <SearchResults query={query} products={results} />
      ) : (
        <SearchEmptyState
          eyebrowLabel="No exact match"
          heading={<>Nothing turned up for “{query}”.</>}
          body="0 found. Try a broader term, or explore the full field system."
          ctaLabel="View all gear"
          ctaHref="/shop"
          announce
        />
      )}
    </div>
  );
}
