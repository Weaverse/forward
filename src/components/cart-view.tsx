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

interface CartViewProps {
  /** Demo lines the cart starts with on a first visit, resolved server-side. */
  seedLines: readonly DemoCartLine[];
}

/**
 * Cart — port of the canonical `cartPage()` (source `app.js:302–309`):
 * heading with live count, the `.cart-line` manifest hierarchy, the signal
 * `.order-summary` panel, and the empty state.
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
    <div className="shell cart-page">
      {/* Cart status changes are announced without stealing focus. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
      <p className="eyebrow">Your field bag · demo only</p>
      <h1 className="h1">
        Cart
        {hydrated
          ? ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
          : ""}
      </h1>

      {!hydrated ? (
        <div className="empty-state section-tight">
          <div className="empty-state-inner">
            <p className="eyebrow">Opening the cart…</p>
          </div>
        </div>
      ) : lines.length > 0 ? (
        <div className="cart-layout section-tight">
          <section className="cart-list" aria-label="Cart items">
            {lines.map((line) => (
              <article key={line.key} className="cart-line">
                <Link href={line.href}>
                  <Image
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="190px"
                  />
                </Link>
                <div>
                  <h2>
                    <Link href={line.href}>{line.title}</Link>
                  </h2>
                  <p className="muted">
                    {line.colorwayName}
                    {line.size !== undefined ? ` · ${line.size}` : ""}
                  </p>
                  <div className="line-controls">
                    {/* Each control names its own line, so the canonical
                        `.quantity` div needs no wrapper role. */}
                    <div className="quantity">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity - 1)}
                      >
                        −
                      </button>
                      <output aria-live="polite">{line.quantity}</output>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-button"
                      type="button"
                      onClick={() => remove(line)}
                    >
                      Remove
                      <span className="sr-only"> {line.title} from cart</span>
                    </button>
                  </div>
                </div>
                <div className="line-price">
                  {formatMoney({
                    amount: line.unitPrice.amount * line.quantity,
                    currencyCode: "USD",
                  })}
                </div>
              </article>
            ))}
          </section>
          <aside className="order-summary" aria-label="Order summary">
            <p className="eyebrow">Order summary</p>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatMoney(cartSubtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Ground delivery</span>
              <span>
                {cartShipping.amount === 0
                  ? "Complimentary"
                  : formatMoney(cartShipping)}
              </span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>
            <p className="summary-note">
              {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD
                ? `${formatMoney({
                    amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                    currencyCode: "USD",
                  })} away from free ground delivery.`
                : "Ground delivery is included on this order."}
            </p>
            <p className="button button-primary button-block" aria-disabled>
              Checkout — not connected
            </p>
            <p className="summary-note">
              This is a demonstration cart held in your browser. No live store,
              payment, or checkout is connected, and nothing here is sent
              anywhere.
            </p>
          </aside>
        </div>
      ) : (
        <div className="empty-state section-tight">
          <div className="empty-state-inner">
            <h2 className="h3">Nothing packed yet.</h2>
            <p className="muted">
              Build a field system around the weather and miles ahead.
            </p>
            <Link className="button button-primary" href="/shop">
              Explore all gear
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
