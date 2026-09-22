"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { FacetList } from "@/components/facet-list";
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
 * The facet controls, for mobile and desktop.
 *
 * Whatever the store returned is what renders — enable a filter in Search &
 * Discovery and it appears here with no theme change. Nothing is shown when
 * the store exposes no facets for this collection.
 */
function CollectionFilters({
  heading,
  sidebarWidth,
  showCounts,
  sticky,
  ...rest
}: CollectionFiltersProps) {
  const { browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (browse === undefined || browse.filters.length === 0) {
    return null;
  }
  const facets = (idPrefix: string) => (
    <FacetList
      filters={browse.filters}
      pathname={pathname}
      params={params}
      idPrefix={idPrefix}
      showCounts={showCounts !== false}
    />
  );

  return (
    <div
      {...elementAttributes(rest)}
      className="w-full shrink-0 lg:w-[var(--collection-sidebar-width)]"
      style={
        {
          "--collection-sidebar-width": `${sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH}px`,
        } as React.CSSProperties
      }
    >
      <details className="group/disclosure border-ink border-b lg:hidden">
        <summary className="flex min-h-touch list-none items-center justify-between font-body text-micro font-medium tracking-label uppercase after:content-['+'] group-open/disclosure:after:content-['−'] [&::-webkit-details-marker]:hidden">
          {heading ?? "Filters"}
        </summary>
        {facets("collection-mobile")}
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
        {facets("collection-desktop")}
      </div>
    </div>
  );
}

export default CollectionFilters;

export { schema } from "./schema";
