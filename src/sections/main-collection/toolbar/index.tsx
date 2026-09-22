"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { describeFilter, SORT_OPTIONS } from "@/lib/storefront/catalog-facets";
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
 * The bar above the results: how many products matched and how they are ordered.
 */
function CollectionToolbar({
  showCount,
  showSort,
  sticky,
  ...rest
}: CollectionToolbarProps) {
  const { collectionProducts, collectionBrowse } = useStorefrontContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (collectionProducts === undefined || collectionBrowse === undefined) {
    return null;
  }
  const count = collectionProducts.length;

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
            {describeFilter(collectionBrowse.filter)}
          </span>
        )}
      </div>
      {showSort === false ? null : (
        <SortForm
          sort={collectionBrowse.sort}
          pathname={pathname}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

/**
 * Sorting as a plain GET form, so it works with no JavaScript.
 *
 * Every param the form does not own travels as a hidden input: the active
 * filter has to survive a re-sort, and so does anything else on the URL.
 */
function SortForm({
  sort,
  pathname,
  searchParams,
}: {
  sort: string;
  pathname: string;
  searchParams: URLSearchParams;
}) {
  const preserved = [...searchParams.entries()].filter(
    ([key]) => key !== "sort" && key !== "page",
  );

  return (
    <form
      className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start"
      method="get"
      action={pathname}
    >
      {preserved.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label
        className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase"
        htmlFor="sort-collection"
      >
        Sort
      </label>
      <select
        className="min-h-touch flex-1 rounded-none border border-ink bg-transparent py-0 pr-9.5 pl-3.5 font-body text-micro font-bold uppercase sm:flex-initial"
        id="sort-collection"
        name="sort"
        defaultValue={sort}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        className="min-h-touch border border-ink bg-transparent px-3.5 font-body text-micro font-extrabold tracking-label uppercase hover:bg-surface-subtle"
        type="submit"
      >
        Apply
      </button>
    </form>
  );
}

export default CollectionToolbar;

export { schema } from "./schema";
