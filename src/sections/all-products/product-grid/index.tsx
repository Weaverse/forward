"use client";

import { type CatalogColumns, CatalogGrid } from "@/components/catalog-grid";
import { Section, type SectionProps } from "@/components/section";
import { useT } from "@/lib/i18n/t";
import { emptyState, eyebrow } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import type { WeaverseElementProps } from "../../weaverse-element";

interface AllProductsGridProps extends WeaverseElementProps {
  columns?: CatalogColumns;
  emptyBody?: string;
  width?: SectionProps["width"];
}

/**
 * The catalog page the store returned, with cursor paging beneath it.
 *
 * The `all-products` shell runs full width for the toolbar, so the grid takes
 * its own content width; its top spacing stays fixed below the toolbar.
 */
function AllProductsGrid({
  columns,
  emptyBody,
  width = "fixed",
  ...rest
}: AllProductsGridProps) {
  const t = useT();
  const { products, browse } = useStorefrontContext();
  if (products === undefined) return null;

  return (
    <Section
      {...rest}
      containerClassName="pt-15.5"
      verticalPadding="none"
      width={width}
    >
      <CatalogGrid
        className="w-full"
        columns={columns}
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
    </Section>
  );
}

export default AllProductsGrid;

export { schema } from "./schema";
