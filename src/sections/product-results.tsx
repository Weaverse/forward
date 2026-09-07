import Link from "next/link";

import { type FilterGroup, FilterSidebar } from "@/components/filter-sidebar";
import { ProductCard } from "@/components/product-card";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

interface ProductResultsProps {
  filterGroups: readonly FilterGroup[];
  products: readonly Product[];
}

/**
 * The Shop results column: mobile filter disclosure, product grid, and the
 * empty state when the current filter matches nothing.
 */
export function ProductResults({
  filterGroups,
  products,
}: ProductResultsProps) {
  return (
    <section aria-label="Products">
      <h2 className="sr-only">Products</h2>
      {/* Mobile filters: the canonical drawer is a JS prototype, so
          Forward uses a no-JavaScript disclosure instead. */}
      <details className="group/disclosure mb-6.5 hidden border border-ink max-md:block">
        <summary className="flex min-h-12 list-none items-center justify-between px-4 font-body text-micro font-medium tracking-label uppercase after:text-lg after:content-['+'] group-open/disclosure:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Filters
        </summary>
        <FilterSidebar groups={filterGroups} idPrefix="mobile" />
      </details>
      {products.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-4.5 gap-y-14 max-lg:grid-cols-2 max-sm:gap-x-2.5 max-sm:gap-y-8.75">
          {products.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <div className={emptyState()}>
          <div className="max-w-form">
            <p className={eyebrow()}>No matching products</p>
            <h2 className={sectionHeading({ size: "subsectionSpaced" })}>
              Nothing in this drawer.
            </h2>
            <p className="text-text-muted">
              No products match this filter. The full catalog is nine products
              deep — try widening the view.
            </p>
            <Link className={cta()} href="/shop">
              View all products
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
