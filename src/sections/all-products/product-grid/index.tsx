"use client";

import { cva } from "class-variance-authority";
import { usePathname, useSearchParams } from "next/navigation";

import { CursorPagination } from "@/components/cursor-pagination";
import { ProductCard } from "@/components/product-card";
import { emptyState, eyebrow } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";

const grid = cva(
  "mx-auto grid w-full max-w-page grid-cols-2 gap-x-2.5 gap-y-8.75 px-page-gutter pt-15.5 sm:gap-x-4.5 sm:gap-y-14",
  {
    variants: {
      columns: { "2": "", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" },
    },
    defaultVariants: { columns: "3" },
  },
);

type Columns = "2" | "3" | "4";

interface AllProductsGridProps extends WeaverseElementProps {
  columns?: Columns;
  emptyBody?: string;
}

/** The catalog page the store returned, with cursor paging beneath it. */
function AllProductsGrid({
  columns,
  emptyBody,
  ...rest
}: AllProductsGridProps) {
  const { products, browse } = useStorefrontContext();
  const pathname = usePathname();
  const params = useSearchParams();
  if (products === undefined) return null;

  return (
    <section
      {...elementAttributes(rest)}
      className="w-full"
      aria-label="Products"
    >
      <h2 className="sr-only">Products</h2>
      {products.length === 0 ? (
        <div className={emptyState({ size: "page" })}>
          <div className="max-w-form">
            <p className={eyebrow()}>Nothing to show</p>
            <p className="text-text-muted">
              {emptyBody ?? "This store has no published products yet."}
            </p>
          </div>
        </div>
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
          {browse === undefined ? null : (
            <div className="mx-auto w-full max-w-page px-page-gutter">
              <CursorPagination
                pageInfo={browse.pageInfo}
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

export default AllProductsGrid;

export { schema } from "./schema";
