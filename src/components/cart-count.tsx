"use client";

import { totalQuantity } from "@/lib/demo-cart/cart-logic";
import { useDemoCartLines } from "@/lib/demo-cart/use-demo-cart";

/**
 * Live item count rendered next to the Cart link. Announced politely so
 * assistive tech hears cart updates from anywhere in the app.
 */
export function CartCount() {
  const lines = useDemoCartLines();
  const count = totalQuantity(lines);
  return (
    <span aria-live="polite" aria-atomic="true">
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"} in cart
      </span>
      <span
        aria-hidden="true"
        className="inline-flex size-5 items-center justify-center rounded-full bg-acid font-field text-[0.625rem] leading-none text-carbon"
      >
        {count}
      </span>
    </span>
  );
}
