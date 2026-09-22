"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { SortForm } from "@/components/sort-form";
import { cn } from "@/lib/cn";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

interface AllProductsToolbarProps extends WeaverseElementProps {
  showCount?: boolean;
  showSort?: boolean;
  sticky?: boolean;
}

/** Count and order for the whole catalog. */
function AllProductsToolbar({
  showCount,
  showSort,
  sticky,
  ...rest
}: AllProductsToolbarProps) {
  const { products, browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (products === undefined || browse === undefined) {
    return null;
  }
  const count = products.length;

  return (
    <div
      {...elementAttributes(rest)}
      className={cn(
        "z-30 flex min-h-18 flex-col items-start justify-between gap-2.5 border-ink border-y bg-signal px-page-gutter py-3 sm:flex-row sm:items-center sm:gap-0 sm:py-2",
        sticky !== false && "sticky top-header-compact md:top-header",
      )}
    >
      {showCount === false ? null : (
        <span className="text-ui sm:text-copy-sm" aria-live="polite">
          {count} {count === 1 ? "product" : "products"}
        </span>
      )}
      {showSort === false ? null : (
        <SortForm
          sort={browse.sort}
          pathname={pathname}
          params={params}
          id="sort-products"
        />
      )}
    </div>
  );
}

export default AllProductsToolbar;

export { schema } from "./schema";
