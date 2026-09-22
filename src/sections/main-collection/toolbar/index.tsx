"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { SortForm } from "@/components/sort-form";
import { cn } from "@/lib/cn";
import {
  clearFiltersHref,
  hasAppliedFilters,
} from "@/lib/storefront/filter-params";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

interface CollectionToolbarProps extends WeaverseElementProps {
  showCount?: boolean;
  showSort?: boolean;
  sticky?: boolean;
}

/**
 * The bar above the results: how many products this page shows, a way to drop
 * every applied facet, and the order control.
 *
 * The count is the page, not the collection: with cursor paging the total is
 * a separate question the store was not asked, and claiming one would be a
 * guess.
 */
function CollectionToolbar({
  showCount,
  showSort,
  sticky,
  ...rest
}: CollectionToolbarProps) {
  const { collectionProducts, browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (collectionProducts === undefined || browse === undefined) {
    return null;
  }
  const count = collectionProducts.length;
  const filtered = hasAppliedFilters(params);

  return (
    <div
      {...elementAttributes(rest)}
      className={cn(
        "z-30 flex min-h-18 flex-col items-start justify-between gap-2.5 border-ink border-y bg-signal px-page-gutter py-3 sm:flex-row sm:items-center sm:gap-0 sm:py-2",
        sticky !== false && "sticky top-header-compact md:top-header",
      )}
    >
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
        {showCount === false ? null : (
          <span className="text-ui sm:text-copy-sm" aria-live="polite">
            {count} {count === 1 ? "product" : "products"}
          </span>
        )}
        {filtered ? (
          <Link
            className="font-body text-micro font-medium tracking-label text-text-muted uppercase underline underline-offset-4 hover:text-ink"
            href={clearFiltersHref(pathname, params)}
          >
            Clear filters
          </Link>
        ) : null}
      </div>
      {showSort === false ? null : (
        <SortForm
          sort={browse.sort}
          pathname={pathname}
          params={params}
          id="sort-collection"
        />
      )}
    </div>
  );
}

export default CollectionToolbar;

export { schema } from "./schema";
