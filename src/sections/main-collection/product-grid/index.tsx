"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { CursorPagination } from "@/components/cursor-pagination";
import { ProductCard } from "@/components/product-card";
import { cta, emptyState, eyebrow } from "@/lib/presentation/variants";
import {
  clearFiltersHref,
  hasAppliedFilters,
} from "@/lib/storefront/filter-params";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

const grid = cva(
  "grid grid-cols-2 gap-x-2.5 gap-y-8.75 sm:gap-x-4.5 sm:gap-y-14",
  {
    variants: {
      columns: { "2": "", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" },
    },
    defaultVariants: { columns: "3" },
  },
);

type Columns = "2" | "3" | "4";

interface CollectionProductGridProps extends WeaverseElementProps {
  columns?: Columns;
  emptyBody?: string;
}

/** The page of results the store returned, or an honest empty state. */
function CollectionProductGrid({
  columns,
  emptyBody,
  ...rest
}: CollectionProductGridProps) {
  const { collectionProducts, browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (collectionProducts === undefined) return null;

  return (
    <section
      {...elementAttributes(rest)}
      className="w-full min-w-0 flex-1"
      aria-label="Products"
    >
      <h2 className="sr-only">Products</h2>
      {collectionProducts.length === 0 ? (
        <div className={emptyState()}>
          <div className="max-w-form">
            <p className={eyebrow()}>No matching products</p>
            <p className="mb-6 text-text-muted">
              {emptyBody ?? "Nothing here matches that filter."}
            </p>
            {/* Clearing drops the facet params only, so a campaign tag or the
                Studio design-mode query on the URL survives the reset. */}
            {hasAppliedFilters(params) ? (
              <Link className={cta()} href={clearFiltersHref(pathname, params)}>
                Clear filters
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className={grid({ columns })}>
            {collectionProducts.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
          {browse === undefined ? null : (
            <CursorPagination
              pageInfo={browse.pageInfo}
              pathname={pathname}
              params={params}
            />
          )}
        </>
      )}
    </section>
  );
}

export default CollectionProductGrid;

export { schema } from "./schema";
