"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  type DemoCartLine,
  FREE_SHIPPING_THRESHOLD,
  shipping,
  subtotal,
  total,
  totalQuantity,
} from "@/lib/demo-cart/cart-logic";
import {
  removeCartLine,
  seedCartOnce,
  setCartLineQuantity,
} from "@/lib/demo-cart/store";
import { useDemoCartLines } from "@/lib/demo-cart/use-demo-cart";
import { formatMoney } from "@/lib/storefront/format";

import {
  CART_DISABLED_CTA,
  CART_EMPTY_HEADING,
  CART_EMPTY_STATE,
  CART_EYEBROW,
  CART_IMAGE,
  CART_LINE,
  CART_LINE_CONTROLS,
  CART_LINE_HEADING,
  CART_PAGE_HEADING,
  CART_PRIMARY_CTA,
  CART_QUANTITY,
  CART_QUANTITY_BUTTON,
  CART_REMOVE_BUTTON,
  CART_SUMMARY_NOTE,
  CART_SUMMARY_ROW,
  CART_SUMMARY_TOTAL,
} from "./presentation";

interface CartViewProps {
  /** Demo lines the cart starts with on a first visit, resolved server-side. */
  seedLines: readonly DemoCartLine[];
}

/**
 * Cart — the accepted manifest hierarchy, live count, signal summary panel,
 * and empty state.
 *
 * Everything below the markup stays Forward-owned: browser-local persistence,
 * sanitized lines, quantity limits, live-region announcements, and an honest
 * disabled checkout instead of the canonical prototype's fake toast.
 */
export function CartView({ seedLines }: CartViewProps) {
  const lines = useDemoCartLines();
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    seedCartOnce(seedLines);
    setHydrated(true);
  }, [seedLines]);

  function updateQuantity(line: DemoCartLine, next: number) {
    setCartLineQuantity(line.key, next);
    setAnnouncement(
      next < 1
        ? `Removed ${line.title} from the cart.`
        : `${line.title} quantity set to ${next}.`,
    );
  }

  function remove(line: DemoCartLine) {
    removeCartLine(line.key);
    setAnnouncement(`Removed ${line.title} from the cart.`);
  }

  const cartSubtotal = subtotal(lines);
  const cartShipping = shipping(lines);
  const cartTotal = total(lines);
  const itemCount = totalQuantity(lines);

  return (
    <div className="mx-auto w-full max-w-page px-page-gutter pt-26.25 pb-section-block-bottom">
      {/* Cart status changes are announced without stealing focus. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
      <p className={CART_EYEBROW}>Your field bag · demo only</p>
      <h1 className={CART_PAGE_HEADING}>
        Cart
        {hydrated
          ? ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
          : ""}
      </h1>

      {!hydrated ? (
        <div className={CART_EMPTY_STATE}>
          <div className="max-w-form">
            <p className={CART_EYEBROW}>Opening the cart…</p>
          </div>
        </div>
      ) : lines.length > 0 ? (
        <div className="grid grid-cols-cart gap-feature-gap py-section-block-compact max-md:grid-cols-1">
          <section
            className="border-border-subtle border-t"
            aria-label="Cart items"
          >
            {lines.map((line) => (
              <article key={line.key} className={CART_LINE}>
                <Link href={line.href}>
                  <Image
                    className={CART_IMAGE}
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="190px"
                  />
                </Link>
                <div>
                  <h2 className={CART_LINE_HEADING}>
                    <Link href={line.href}>{line.title}</Link>
                  </h2>
                  <p className="text-text-muted">
                    {[
                      line.colorwayName,
                      ...Object.values(line.selectedOptions),
                    ].join(" · ")}
                  </p>
                  <div className={CART_LINE_CONTROLS}>
                    {/* Each control names its own line, so the quantity group
                        needs no wrapper role. */}
                    <div className={CART_QUANTITY}>
                      <button
                        className={CART_QUANTITY_BUTTON}
                        type="button"
                        aria-label={`Decrease quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity - 1)}
                      >
                        −
                      </button>
                      <output
                        className="grid place-items-center font-bold"
                        aria-live="polite"
                      >
                        {line.quantity}
                      </output>
                      <button
                        className={CART_QUANTITY_BUTTON}
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={CART_REMOVE_BUTTON}
                      type="button"
                      onClick={() => remove(line)}
                    >
                      Remove
                      <span className="sr-only"> {line.title} from cart</span>
                    </button>
                  </div>
                </div>
                <div className="font-bold whitespace-nowrap max-sm:col-start-2">
                  {formatMoney({
                    amount: line.unitPrice.amount * line.quantity,
                    currencyCode: "USD",
                  })}
                </div>
              </article>
            ))}
          </section>
          <aside
            className="self-start bg-signal p-7 text-ink"
            aria-label="Order summary"
          >
            <p className={CART_EYEBROW}>Order summary</p>
            <div className={CART_SUMMARY_ROW}>
              <span>Subtotal</span>
              <strong>{formatMoney(cartSubtotal)}</strong>
            </div>
            <div className={CART_SUMMARY_ROW}>
              <span>Ground delivery</span>
              <span>
                {cartShipping.amount === 0
                  ? "Complimentary"
                  : formatMoney(cartShipping)}
              </span>
            </div>
            <div className={CART_SUMMARY_TOTAL}>
              <span>Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>
            <p className={CART_SUMMARY_NOTE}>
              {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD
                ? `${formatMoney({
                    amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                    currencyCode: "USD",
                  })} away from free ground delivery.`
                : "Ground delivery is included on this order."}
            </p>
            <p className={CART_DISABLED_CTA} aria-disabled>
              Checkout — not connected
            </p>
            <p className={CART_SUMMARY_NOTE}>
              This is a demonstration cart held in your browser. No live store,
              payment, or checkout is connected, and nothing here is sent
              anywhere.
            </p>
          </aside>
        </div>
      ) : (
        <div className={CART_EMPTY_STATE}>
          <div className="max-w-form">
            <h2 className={CART_EMPTY_HEADING}>Nothing packed yet.</h2>
            <p className="text-text-muted">
              Build a field system around the weather and miles ahead.
            </p>
            <Link className={CART_PRIMARY_CTA} href="/shop">
              Explore all gear
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
