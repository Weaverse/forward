"use client";

import { type CatalogColumns, CatalogGrid } from "@/components/catalog-grid";
import { useT } from "@/lib/i18n/t";
import { emptyState, eyebrow } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import type { WeaverseElementProps } from "../../weaverse-element";

interface AllProductsGridProps extends WeaverseElementProps {
  columns?: CatalogColumns;
  emptyBody?: string;
}

/** The catalog page the store returned, with cursor paging beneath it. */
function AllProductsGrid({ emptyBody, ...rest }: AllProductsGridProps) {
  const t = useT();
  const { products, browse } = useStorefrontContext();
  if (products === undefined) return null;

  return (
    <CatalogGrid
      {...rest}
      className="w-full"
      contained
      products={products}
      pageInfo={browse?.pageInfo}
      empty={
        <div className={emptyState({ size: "page" })}>
          <div className="max-w-form">
            <p className={eyebrow()}>{t("catalog.emptyHeading")}</p>
            <p className="text-text-muted">
              {emptyBody ?? t("catalog.emptyBody")}
            </p>
          </div>
        </div>
      }
    />
  );
}

export default AllProductsGrid;

export { schema } from "./schema";
