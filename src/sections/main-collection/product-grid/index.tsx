"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { cta, emptyState, eyebrow } from "@/lib/presentation/variants";
import { catalogHref } from "@/lib/storefront/catalog-facets";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

const DEFAULT_PAGE_SIZE = 12;

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
  pageSize?: number;
  emptyBody?: string;
}

/** The results grid, or the honest empty state when nothing matched. */
function CollectionProductGrid({
  columns,
  pageSize,
  emptyBody,
  ...rest
}: CollectionProductGridProps) {
  const { collectionProducts } = useStorefrontContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (collectionProducts === undefined) return null;

  /* ponytail: paged in the browser over the collection's products, which both
   * adapters already hold in memory. Move to a cursor read through the
   * storefront seam if a collection ever outgrows a single response. */
  const size = pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(collectionProducts.length / size));
  const requested = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const current = Math.min(
    Number.isFinite(requested) && requested > 0 ? requested : 1,
    pageCount,
  );
  const visible = collectionProducts.slice(
    (current - 1) * size,
    current * size,
  );
  const pageHref = (page: number) =>
    catalogHref(pathname, searchParams, {
      page: page === 1 ? undefined : String(page),
    });

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
              {emptyBody ?? "Nothing in this collection matches that filter."}
            </p>
            {/* Clearing drops only the facet params, so a campaign tag or a
                Studio design-mode query on the URL survives the reset. */}
            <Link
              className={cta()}
              href={catalogHref(pathname, searchParams, {
                category: undefined,
                activity: undefined,
                page: undefined,
              })}
            >
              Clear filters
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={grid({ columns })}>
            {visible.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={current === 1 && index < 2}
              />
            ))}
          </div>
          {pageCount > 1 ? (
            <nav
              className="mt-14 flex items-center justify-center gap-2.5"
              aria-label="Pagination"
            >
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (page) => (
                  <Link
                    key={page}
                    className="flex min-h-touch min-w-touch items-center justify-center border border-ink px-3.5 font-body text-micro font-bold tabular-nums uppercase hover:bg-surface-subtle aria-[current=page]:bg-ink aria-[current=page]:text-text-inverse"
                    href={pageHref(page)}
                    aria-current={page === current ? "page" : undefined}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </Link>
                ),
              )}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}

export default CollectionProductGrid;

export { schema } from "./schema";
