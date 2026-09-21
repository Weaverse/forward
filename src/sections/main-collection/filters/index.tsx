"use client";

import type { CSSProperties } from "react";

import { FilterSidebar } from "@/components/filter-sidebar";
import { cn } from "@/lib/cn";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

const DEFAULT_SIDEBAR_WIDTH = 288;

interface CollectionFiltersProps extends WeaverseElementProps {
  heading?: string;
  sidebarWidth?: number;
  showCounts?: boolean;
  sticky?: boolean;
}

/**
 * The facet controls for mobile and desktop.
 *
 * Every row is an href the route already validated, so narrowing a collection
 * needs no JavaScript and every result is a URL a shopper can share. Both
 * layouts use this component's settings, so counts cannot diverge by viewport.
 */
function CollectionFilters({
  heading,
  sidebarWidth,
  showCounts,
  sticky,
  ...rest
}: CollectionFiltersProps) {
  const { collectionBrowse } = useStorefrontContext();
  if (collectionBrowse === undefined || collectionBrowse.facets.length === 0) {
    return null;
  }

  return (
    <div
      {...elementAttributes(rest)}
      className="w-full shrink-0 lg:w-[var(--collection-sidebar-width)]"
      style={
        {
          "--collection-sidebar-width": `${sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH}px`,
        } as CSSProperties
      }
    >
      <details className="group/disclosure border-ink border-b lg:hidden">
        <summary className="flex min-h-touch list-none items-center justify-between font-body text-micro font-medium tracking-label uppercase after:content-['+'] group-open/disclosure:after:content-['−'] [&::-webkit-details-marker]:hidden">
          {heading ?? "Filters"}
        </summary>
        <FilterSidebar
          groups={collectionBrowse.facets}
          idPrefix="collection-mobile"
          showCounts={showCounts !== false}
        />
      </details>
      <div
        className={cn(
          "hidden flex-col gap-4 lg:flex",
          sticky !== false && "sticky top-[calc(var(--spacing-header)+30px)]",
        )}
      >
        <h2 className="font-body text-micro font-extrabold tracking-label uppercase">
          {heading ?? "Filters"}
        </h2>
        <FilterSidebar
          groups={collectionBrowse.facets}
          idPrefix="collection-desktop"
          showCounts={showCounts !== false}
        />
      </div>
    </div>
  );
}

export default CollectionFilters;

export { schema } from "./schema";
