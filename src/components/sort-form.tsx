"use client";

import { useT } from "@/lib/i18n/t";
import { SORT_OPTIONS } from "@/lib/storefront/sort";
import type { ProductSort } from "@/lib/storefront/types";

/**
 * A native select, styled as a customizable select (`appearance: base-select`)
 * where the browser supports it so the dropdown follows the theme. Elsewhere
 * the rules are ignored and the platform select stays, with room for its own
 * arrow.
 */
const SORT_SELECT_CLASS = [
  "min-h-touch flex-1 rounded-none border border-ink bg-transparent py-0 pr-9.5 pl-3.5 font-body text-micro font-bold uppercase sm:flex-initial",
  /* As a base-select the element lays its label and icon out as a flex row:
   * centre them, push the icon to the edge and keep the native width. */
  "[appearance:base-select] supports-[appearance:base-select]:pr-3.5",
  "items-center justify-between gap-4 sm:min-w-36",
  /* The default icon is a filled triangle; draw the platform-style chevron. */
  "[&::picker-icon]:size-2 [&::picker-icon]:-translate-y-0.5 [&::picker-icon]:rotate-45 [&::picker-icon]:border-current [&::picker-icon]:border-r-[1.5px] [&::picker-icon]:border-b-[1.5px] [&::picker-icon]:content-[''] [&::picker-icon]:transition-transform",
  "open:[&::picker-icon]:translate-y-0.5 open:[&::picker-icon]:-rotate-135",
  "picker:[appearance:base-select] picker:mt-1 picker:rounded-none picker:border picker:border-ink picker:bg-canvas picker:p-0",
  "[&_option]:min-h-touch [&_option]:px-3.5 [&_option]:font-body [&_option]:text-micro [&_option]:font-bold [&_option]:uppercase",
  /* Hover sets its own text colour, or a hovered selected option keeps the
   * inverse text on the signal fill. */
  "[&_option:checked]:bg-ink [&_option:checked]:text-text-inverse [&_option:hover]:bg-signal [&_option:hover]:text-ink [&_option::checkmark]:hidden",
].join(" ");

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
  const t = useT();
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
        {t("catalog.sort")}
      </label>
      <select
        className={SORT_SELECT_CLASS}
        id={id}
        name="sort"
        defaultValue={sort}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
      <button
        className="min-h-touch border border-ink bg-transparent px-3.5 font-body text-micro font-extrabold tracking-label uppercase hover:bg-surface-subtle"
        type="submit"
      >
        {t("catalog.apply")}
      </button>
    </form>
  );
}
