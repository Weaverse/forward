"use client";

import { cva } from "class-variance-authority";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { CursorPagination } from "@/components/cursor-pagination";
import { ProductCard } from "@/components/product-card";
import { usePathname } from "@/lib/i18n/locale-context";
import { useT } from "@/lib/i18n/t";
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

interface CatalogGridProps extends WeaverseElementProps {
  products: readonly Product[];
  pageInfo?: CollectionProductsPage["pageInfo"];
  columns?: CatalogColumns;
  className?: string;
  /** What shows when the store returned no products for this page. */
  empty: ReactNode;
}

/** A page of products the store returned, with cursor paging beneath it. */
export function CatalogGrid({
  products,
  pageInfo,
  columns,
  className,
  empty,
  ...rest
}: CatalogGridProps) {
  const t = useT();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <section
      {...elementAttributes(rest)}
      className={className}
      aria-label={t("catalog.products")}
    >
      <h2 className="sr-only">{t("catalog.products")}</h2>
      {products.length === 0 ? (
        empty
      ) : (
        <>
          <div className={grid({ columns })}>
            {products.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
          {pageInfo === undefined ? null : (
            <CursorPagination
              pageInfo={pageInfo}
              pathname={pathname}
              params={params}
            />
          )}
        </>
      )}
    </section>
  );
}
