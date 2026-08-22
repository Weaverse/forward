"use client";

import { totalQuantity } from "@/lib/demo-cart/cart-logic";
import { useDemoCartLines } from "@/lib/demo-cart/use-demo-cart";
import {
  useShopifyCart,
  useShopifyCartMode,
} from "@/lib/cart/shopify-cart-react";

/**
 * Canonical cart badge (source `app.js:155`), kept live and announced politely
 * so assistive tech hears cart updates from anywhere.
 */
function Count({ count }: { count: number }) {
  return (
    <span aria-live="polite" aria-atomic="true">
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"} in cart
      </span>
      <span
        aria-hidden="true"
        className="inline-grid h-5 min-w-5 place-items-center rounded-[50%] bg-signal px-[5px] text-[10px]"
      >
        {count}
      </span>
    </span>
  );
}

function DemoCartCount() {
  const lines = useDemoCartLines();
  return <Count count={totalQuantity(lines)} />;
}

function LiveCartCount() {
  const count = useShopifyCart((state) => state.data.totalQuantity);
  return <Count count={count} />;
}

export function CartCount() {
  return useShopifyCartMode() ? <LiveCartCount /> : <DemoCartCount />;
}
