"use client";

import { cva } from "class-variance-authority";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { CursorPagination } from "@/components/cursor-pagination";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import { usePathname } from "@/lib/i18n/locale-context";
import type { CollectionProductsPage, Product } from "@/lib/storefront/types";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

export type CatalogColumns = "2" | "3" | "4";

const grid = cva(
  "grid grid-cols-2 gap-x-2.5 gap-y-8.75 sm:gap-x-4.5 sm:gap-y-14",
  {
    variants: {
      columns: { "2": "", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" },
    },
    defaultVariants: { columns: "3" },
  },
);

/** Full-bleed placements put the grid and its paging in the page container. */
const PAGE_CONTAINER = "mx-auto w-full max-w-page px-page-gutter";

interface CatalogGridProps extends WeaverseElementProps {
  products: readonly Product[];
  pageInfo?: CollectionProductsPage["pageInfo"];
  columns?: CatalogColumns;
  /** Whether the grid sits in the page container or in a row that has one. */
  contained?: boolean;
  className?: string;
  /** What shows when the store returned no products for this page. */
  empty: ReactNode;
}

/** A page of products the store returned, with cursor paging beneath it. */
export function CatalogGrid({
  products,
  pageInfo,
  columns,
  contained,
  className,
  empty,
  ...rest
}: CatalogGridProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <section
      {...elementAttributes(rest)}
      className={className}
      aria-label="Products"
    >
      <h2 className="sr-only">Products</h2>
      {products.length === 0 ? (
        empty
      ) : (
        <>
          <div
            className={cn(
              grid({ columns }),
              contained && PAGE_CONTAINER,
              contained && "pt-15.5",
            )}
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
          {pageInfo === undefined ? null : (
            <div className={cn(contained && PAGE_CONTAINER)}>
              <CursorPagination
                pageInfo={pageInfo}
                pathname={pathname}
                params={params}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
