"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { type CatalogColumns, CatalogGrid } from "@/components/catalog-grid";
import { cta, emptyState, eyebrow } from "@/lib/presentation/variants";
import {
  clearFiltersHref,
  hasAppliedFilters,
} from "@/lib/storefront/filter-params";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import type { WeaverseElementProps } from "../../weaverse-element";

interface CollectionProductGridProps extends WeaverseElementProps {
  columns?: CatalogColumns;
  emptyBody?: string;
}

/** The page of results the store returned, or an honest empty state. */
function CollectionProductGrid({
  emptyBody,
  ...rest
}: CollectionProductGridProps) {
  const { collectionProducts, browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (collectionProducts === undefined) return null;

  return (
    <CatalogGrid
      {...rest}
      className="w-full min-w-0 flex-1"
      products={collectionProducts}
      pageInfo={browse?.pageInfo}
      empty={
        <div className={emptyState()}>
          <div className="max-w-form">
            <p className={eyebrow()}>No matching products</p>
            <p className="mb-6 text-text-muted">
              {emptyBody ?? "Nothing here matches that filter."}
            </p>
            {/* Clearing drops the facet params only, so a campaign tag or the
                Studio design-mode query on the URL survives the reset. */}
            {hasAppliedFilters(params) ? (
              <Link className={cta()} href={clearFiltersHref(pathname, params)}>
                Clear filters
              </Link>
            ) : null}
          </div>
        </div>
      }
    />
  );
}

export default CollectionProductGrid;

export { schema } from "./schema";
