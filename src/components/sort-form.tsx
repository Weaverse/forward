"use client";

import { SORT_OPTIONS } from "@/lib/storefront/sort";
import type { ProductSort } from "@/lib/storefront/types";

/**
 * Ordering as a plain GET form, so it works with no JavaScript.
 *
 * Every param the form does not own travels as a hidden input: the applied
 * facets have to survive a re-sort, and so does anything else on the URL. The
 * cursor deliberately does not — a new order invalidates it.
 */
export function SortForm({
  sort,
  pathname,
  params,
  id,
}: {
  sort: ProductSort;
  pathname: string;
  params: URLSearchParams;
  id: string;
}) {
  const preserved = [...params.entries()].filter(
    ([key]) => key !== "sort" && key !== "after" && key !== "before",
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
        htmlFor={id}
      >
        Sort
      </label>
      <select
        className="min-h-touch flex-1 rounded-none border border-ink bg-transparent py-0 pr-9.5 pl-3.5 font-body text-micro font-bold uppercase sm:flex-initial"
        id={id}
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
