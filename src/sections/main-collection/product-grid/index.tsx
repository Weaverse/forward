"use client";

import { useSearchParams } from "next/navigation";
import { type CatalogColumns, CatalogGrid } from "@/components/catalog-grid";
import { Link } from "@/components/link";
import { usePathname } from "@/lib/i18n/locale-context";
import { useT } from "@/lib/i18n/t";
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
  const t = useT();
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
            <p className={eyebrow()}>{t("catalog.noMatchesHeading")}</p>
            <p className="mb-6 text-text-muted">
              {emptyBody ?? t("catalog.noMatchesBody")}
            </p>
            {/* Clearing drops the facet params only, so a campaign tag or the
                Studio design-mode query on the URL survives the reset. */}
            {hasAppliedFilters(params) ? (
              <Link className={cta()} href={clearFiltersHref(pathname, params)}>
                {t("catalog.clearFilters")}
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
