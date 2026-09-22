"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import {
  AFTER_PARAM,
  BEFORE_PARAM,
  isValueApplied,
  PRICE_MAX_PARAM,
  PRICE_MIN_PARAM,
  parsePriceRange,
  toggleValueHref,
} from "@/lib/storefront/filter-params";
import type { StorefrontFilter } from "@/lib/storefront/types";

interface FacetListProps {
  filters: readonly StorefrontFilter[];
  pathname: string;
  params: URLSearchParams;
  idPrefix: string;
  showCounts?: boolean;
}

/**
 * The store's facets, rendered from whatever it returned.
 *
 * A `LIST` facet is a set of links; a `PRICE_RANGE` facet is a plain GET form
 * over the same href contract. Neither needs JavaScript, and a facet type the
 * theme has no renderer for is skipped rather than guessed at.
 */
export function FacetList({
  filters,
  pathname,
  params,
  idPrefix,
  showCounts = true,
}: FacetListProps) {
  return (
    <div className="border-border-subtle border-t">
      {filters.map((filter) => (
        <details
          key={`${idPrefix}-${filter.id}`}
          className="group/filter border-border-subtle border-b"
          open
        >
          <summary className="flex min-h-13 list-none items-center justify-between font-body text-micro font-medium tracking-label uppercase after:text-lg after:font-normal after:content-['+'] group-open/filter:after:content-['−'] [&::-webkit-details-marker]:hidden">
            {filter.label}
          </summary>
          <div className="pb-4.5">
            {filter.type === "PRICE_RANGE" ? (
              <PriceRange
                filter={filter}
                pathname={pathname}
                params={params}
                idPrefix={idPrefix}
              />
            ) : filter.type === "LIST" || filter.type === "BOOLEAN" ? (
              filter.values.map((value) => {
                const applied = isValueApplied(params, filter, value);
                return (
                  <Link
                    key={value.id}
                    className="group/check flex min-h-10 items-center gap-2.5 font-body text-micro text-text-muted tracking-control uppercase hover:text-ink aria-[current=true]:text-ink"
                    href={toggleValueHref(pathname, params, filter, value)}
                    aria-current={applied ? "true" : undefined}
                  >
                    <span
                      className={cn(
                        "size-3.25 flex-none rounded-full border border-border-subtle",
                        applied && "border-ink bg-signal",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{value.label}</span>
                    {showCounts ? (
                      <span className="tabular-nums">{value.count}</span>
                    ) : null}
                  </Link>
                );
              })
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

/**
 * A price range as a GET form.
 *
 * The bounds the store reported are the input placeholders, so the shopper
 * sees the range that actually exists before typing one.
 */
function PriceRange({
  filter,
  pathname,
  params,
  idPrefix,
}: {
  filter: StorefrontFilter;
  pathname: string;
  params: URLSearchParams;
  idPrefix: string;
}) {
  const bounds = (() => {
    try {
      const parsed = JSON.parse(filter.values[0]?.input ?? "{}") as {
        price?: { min?: number; max?: number };
      };
      return parsed.price ?? {};
    } catch {
      return {};
    }
  })();
  const applied = parsePriceRange(params) ?? {};
  /* Everything the form does not own travels as a hidden input, so the active
     facets and the chosen order survive a submit. */
  const preserved = [...params.entries()].filter(
    ([key]) =>
      key !== PRICE_MIN_PARAM &&
      key !== PRICE_MAX_PARAM &&
      key !== AFTER_PARAM &&
      key !== BEFORE_PARAM,
  );

  return (
    <form action={pathname} method="get" className="flex flex-col gap-2.5 pt-1">
      {preserved.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className="flex items-center gap-2.5">
        <label className="sr-only" htmlFor={`${idPrefix}-price-min`}>
          Minimum price
        </label>
        <input
          className="min-h-touch w-full min-w-0 rounded-none border border-border-subtle bg-transparent px-2.5 font-body text-micro tabular-nums"
          id={`${idPrefix}-price-min`}
          name={PRICE_MIN_PARAM}
          type="number"
          inputMode="numeric"
          min={bounds.min}
          max={bounds.max}
          placeholder={bounds.min === undefined ? "" : String(bounds.min)}
          defaultValue={applied.min}
        />
        <span className="font-body text-micro text-text-muted">to</span>
        <label className="sr-only" htmlFor={`${idPrefix}-price-max`}>
          Maximum price
        </label>
        <input
          className="min-h-touch w-full min-w-0 rounded-none border border-border-subtle bg-transparent px-2.5 font-body text-micro tabular-nums"
          id={`${idPrefix}-price-max`}
          name={PRICE_MAX_PARAM}
          type="number"
          inputMode="numeric"
          min={bounds.min}
          max={bounds.max}
          placeholder={bounds.max === undefined ? "" : String(bounds.max)}
          defaultValue={applied.max}
        />
      </div>
      <button
        className="min-h-touch self-start border border-ink bg-transparent px-3.5 font-body text-micro font-extrabold tracking-label uppercase hover:bg-surface-subtle"
        type="submit"
      >
        Apply
      </button>
    </form>
  );
}
