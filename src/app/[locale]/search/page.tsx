import type { Metadata } from "next";

import { DEFAULT_LOCALE, localizePath, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { T } from "@/lib/i18n/t";
import { getTranslator } from "@/lib/i18n/translator";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { getStorefront } from "@/lib/storefront/data-source";
import { SearchEmptyState } from "@/sections/search-empty-state";
import { SearchResults } from "@/sections/search-results";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Pick<SearchPageProps, "params">): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    title: t("search.metaTitle"),
    description: t("search.metaDescription"),
  };
}

/** Plain GET search backed by the normalized server-side catalog. */
export default async function SearchPage({
  params: routeParams,
  searchParams,
}: SearchPageProps) {
  const locale = await routeLocale(routeParams);
  const t = await getTranslator(locale);
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const results =
    query.length > 0 ? await getStorefront(locale).searchProducts(query) : [];
  const hasQuery = query.length > 0;

  return (
    <div className="mx-auto w-full max-w-page px-page-gutter pt-26.25 pb-section-block-bottom">
      <p className={eyebrow()}>
        <T k="search.eyebrow" />
      </p>
      <h1 className={sectionHeading({ size: "display" })}>
        <T k="search.heading" />
      </h1>
      <form
        className="mt-17.5 mb-15 grid grid-cols-1 border-ink border-b-3 sm:grid-cols-lead-trailing"
        method="get"
        action={localizePath("/search", locale)}
      >
        <label className="sr-only" htmlFor="search-input">
          <T k="search.inputLabel" />
        </label>
        <input
          id="search-input"
          name="q"
          type="search"
          className="h-16 min-w-0 border-0 bg-transparent font-heading text-search-display focus:outline-0 sm:h-27.5"
          defaultValue={rawQuery}
          placeholder={t("search.placeholder")}
        />
        <button
          className="min-h-12 min-w-25 justify-self-start bg-transparent font-body text-caption font-extrabold tracking-label uppercase sm:min-h-auto sm:justify-self-auto"
          type="submit"
        >
          <T k="search.submit" />
        </button>
      </form>

      {!hasQuery ? (
        <SearchEmptyState
          eyebrowLabel={<T k="search.startEyebrow" />}
          heading={<T k="search.startHeading" />}
          body={<T k="search.startBody" />}
          ctaLabel={<T k="search.startCta" />}
          ctaHref="/shop"
        />
      ) : results.length > 0 ? (
        <SearchResults
          label={t("search.results")}
          query={query}
          products={results}
        />
      ) : (
        <SearchEmptyState
          eyebrowLabel={<T k="search.noMatchEyebrow" />}
          heading={<T k="search.noMatchHeading" vars={{ query }} />}
          body={<T k="search.noMatchBody" />}
          ctaLabel={<T k="search.noMatchCta" />}
          ctaHref="/shop"
          announce
        />
      )}
    </div>
  );
}
