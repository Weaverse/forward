"use client";

import { useShopifyCart } from "@/lib/cart/shopify-cart-react";
import { useT } from "@/lib/i18n/t";

/** Live cart badge announced politely to assistive technology. */
export function CartCount() {
  const t = useT();
  const count = useShopifyCart((state) => state.data.totalQuantity);
  return (
    <span aria-live="polite" aria-atomic="true">
      <span className="sr-only">
        ,{" "}
        {t(count === 1 ? "header.cartCountOne" : "header.cartCountOther", {
          count,
        })}
      </span>
      <span
        aria-hidden="true"
        className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1.25 text-field-meta text-ink"
      >
        {count}
      </span>
    </span>
  );
}
