"use client";

import { formatMoney } from "@/lib/storefront/format";
import { saleCompareAtPrice } from "@/lib/storefront/product-state";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

interface ProductPricesProps extends WeaverseElementProps {
  showCompareAtPrice?: boolean;
  showSaleBadge?: boolean;
  saleBadgeText?: string;
}

/** The selected variant's price, with the sale treatment when it is real. */
function ProductPrices({
  showCompareAtPrice,
  showSaleBadge,
  saleBadgeText,
  ...rest
}: ProductPricesProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { variant } = state.selection;
  const compareAt =
    showCompareAtPrice === false ? null : saleCompareAtPrice(variant);
  const badge = saleBadgeText || "On sale";

  return (
    <p
      {...elementAttributes(rest)}
      className="m-0 flex flex-wrap items-baseline gap-2.5 text-label whitespace-nowrap"
    >
      <strong>
        <span className="sr-only">
          {compareAt !== null ? "Sale price " : "Price "}
        </span>
        {formatMoney(variant.price)}
      </strong>
      {compareAt !== null ? (
        <>
          <del className="text-text-dark-muted line-through">
            <span className="sr-only">Regular price </span>
            {formatMoney(compareAt)}
          </del>
          {showSaleBadge === false ? null : (
            <span className="bg-signal px-2 py-1 font-body text-ui font-extrabold text-ink tracking-control uppercase">
              {badge}
            </span>
          )}
        </>
      ) : null}
    </p>
  );
}

export default ProductPrices;

export { schema } from "./schema";
