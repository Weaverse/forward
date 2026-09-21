"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { cta, emptyState, eyebrow } from "@/lib/presentation/variants";
import { catalogHref } from "@/lib/storefront/catalog-facets";
import type { Product } from "@/lib/storefront/types";
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
  emptyHeading?: string;
  emptyBody?: string;
}

/** The results grid, or the honest empty state when nothing matched. */
function CollectionProductGrid(props: CollectionProductGridProps) {
  const { collectionProducts } = useStorefrontContext();
  if (collectionProducts === undefined) return null;
  return (
    <Suspense fallback={<Results {...props} page={1} />}>
      <PagedResults {...props} />
    </Suspense>
  );
}

function PagedResults(props: CollectionProductGridProps) {
  const searchParams = useSearchParams();
  const requested = Number.parseInt(searchParams.get("page") ?? "1", 10);
  return (
    <Results
      {...props}
      page={Number.isFinite(requested) && requested > 0 ? requested : 1}
    />
  );
}

function Results({
  columns,
  pageSize,
  emptyHeading,
  emptyBody,
  page,
  ...rest
}: CollectionProductGridProps & { page: number }) {
  const { collectionProducts } = useStorefrontContext();
  const products = collectionProducts ?? [];
  /* ponytail: paged in the browser over the collection's products, which both
   * adapters already hold in memory. Move to a cursor read through the
   * storefront seam if a collection ever outgrows a single response. */
  const size = pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(products.length / size));
  const current = Math.min(page, pageCount);
  const visible = products.slice((current - 1) * size, current * size);

  return (
    <section
      {...elementAttributes(rest)}
      className="w-full min-w-0 flex-1"
      aria-label="Products"
    >
      <h2 className="sr-only">Products</h2>
      {products.length > 0 ? (
        <>
          <div className={grid({ columns })}>
            {visible.map((product: Product, index: number) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={current === 1 && index < 2}
              />
            ))}
          </div>
          <Pagination current={current} pageCount={pageCount} />
        </>
      ) : (
        <EmptyResults heading={emptyHeading} body={emptyBody} />
      )}
    </section>
  );
}

function Pagination({
  current,
  pageCount,
}: {
  current: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pageCount < 2) return null;

  const href = (page: number) =>
    catalogHref(pathname, searchParams, {
      page: page === 1 ? undefined : String(page),
    });

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2.5"
      aria-label="Pagination"
    >
      {Array.from({ length: pageCount }, (_, index) => index + 1).map(
        (page) => (
          <Link
            key={page}
            className="flex min-h-touch min-w-touch items-center justify-center border border-ink px-3.5 font-body text-micro font-bold tabular-nums uppercase hover:bg-surface-subtle aria-[current=page]:bg-ink aria-[current=page]:text-text-inverse"
            href={href(page)}
            aria-current={page === current ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Link>
        ),
      )}
    </nav>
  );
}

function EmptyResults({ heading, body }: { heading?: string; body?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /* Clearing drops only the facet params, so a campaign tag or a Studio
   * design-mode query on the URL survives the reset. */
  const clearHref = catalogHref(pathname, searchParams, {
    category: undefined,
    activity: undefined,
    page: undefined,
  });

  return (
    <div className={emptyState()}>
      <div className="max-w-form">
        <p className={eyebrow()}>No matching products</p>
        <p className="mb-6 text-text-muted">
          {body ?? "Nothing in this collection matches that filter."}
        </p>
        <Link className={cta()} href={clearHref}>
          {heading ?? "Clear filters"}
        </Link>
      </div>
    </div>
  );
}

export default CollectionProductGrid;

export { schema } from "./schema";
