"use client";

import { totalQuantity } from "@/lib/demo-cart/cart-logic";
import { useDemoCartLines } from "@/lib/demo-cart/use-demo-cart";

/**
 * Canonical `.cart-count` badge (source `app.js:155`), kept live and
 * announced politely so assistive tech hears cart updates from anywhere.
 */
export function CartCount() {
  const lines = useDemoCartLines();
  const count = totalQuantity(lines);
  return (
    <span aria-live="polite" aria-atomic="true">
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"} in cart
      </span>
      <span aria-hidden="true" className="cart-count">
        {count}
      </span>
    </span>
  );
}
