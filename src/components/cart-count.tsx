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
        className="ml-1.5 inline-flex min-w-5 items-center justify-center border border-current px-1 font-field text-[0.625rem] leading-4"
      >
        {count}
      </span>
    </span>
  );
}
