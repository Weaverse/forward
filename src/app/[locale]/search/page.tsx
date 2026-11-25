import type { Metadata } from "next";

import { PredictiveSearchForm } from "@/components/predictive-search-form";
import { ResourceViewed } from "@/lib/analytics";
import { routeLocale } from "@/lib/i18n/route-locale";
import { T } from "@/lib/i18n/t";
import { getTranslator, translatedMetadata } from "@/lib/i18n/translator";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { getStorefront } from "@/lib/storefront/data-source";
import { SearchEmptyState } from "@/sections/search-empty-state";
import { SearchResults } from "@/sections/search-results";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateMetadata({
  params,
}: Pick<SearchPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "search.metaTitle",
    description: "search.metaDescription",
    robots: { index: false, follow: true },
  });
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
      {hasQuery ? (
        <ResourceViewed
          event="search_viewed"
          payload={{
            searchTerm: query,
            searchResults: { totalCount: results.length },
          }}
          viewKey={query}
        />
      ) : null}
      <p className={eyebrow()}>
        <T k="search.eyebrow" />
      </p>
      <h1 className={sectionHeading({ size: "display" })}>
        <T k="search.heading" />
      </h1>
      <PredictiveSearchForm key={rawQuery} defaultQuery={rawQuery} />

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
