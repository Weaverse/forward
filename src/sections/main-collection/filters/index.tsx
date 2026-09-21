"use client";

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
 * The facet sidebar.
 *
 * Every row is an href the route already validated, so narrowing a collection
 * needs no JavaScript and every result is a URL a shopper can share. Hidden
 * below `lg`, where the toolbar's disclosure carries the same groups.
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
      className="hidden w-full shrink-0 lg:block"
      style={{ width: sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH }}
    >
      <div
        className={cn(
          "flex flex-col gap-4",
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
