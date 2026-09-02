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
  demoCartDisabledCta,
  demoCartPrimaryCta,
  cartEmptyHeading,
  cartEmptyState,
  cartEyebrow,
  cartImage,
  cartLine,
  cartLineControls,
  cartLineHeading,
  cartPageHeading,
  cartQuantity,
  cartQuantityButton,
  cartRemoveButton,
  cartSummaryNote,
  cartSummaryRow,
  cartSummaryTotal,
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
    <div className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter pt-[105px] pb-[clamp(56px,8vw,110px)]">
      {/* Cart status changes are announced without stealing focus. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
      <p className={cartEyebrow}>Your field bag · demo only</p>
      <h1 className={cartPageHeading}>
        Cart
        {hydrated
          ? ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
          : ""}
      </h1>

      {!hydrated ? (
        <div className={cartEmptyState}>
          <div className="max-w-[500px]">
            <p className={cartEyebrow}>Opening the cart…</p>
          </div>
        </div>
      ) : lines.length > 0 ? (
        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] gap-[clamp(40px,8vw,110px)] py-[clamp(42px,6vw,84px)] max-md:grid-cols-1">
          <section
            className="border-border-subtle border-t"
            aria-label="Cart items"
          >
            {lines.map((line) => (
              <article key={line.key} className={cartLine}>
                <Link href={line.href}>
                  <Image
                    className={cartImage}
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="190px"
                  />
                </Link>
                <div>
                  <h2 className={cartLineHeading}>
                    <Link href={line.href}>{line.title}</Link>
                  </h2>
                  <p className="text-text-muted">
                    {[
                      line.colorwayName,
                      ...Object.values(line.selectedOptions),
                    ].join(" · ")}
                  </p>
                  <div className={cartLineControls}>
                    {/* Each control names its own line, so the quantity group
                        needs no wrapper role. */}
                    <div className={cartQuantity}>
                      <button
                        className={cartQuantityButton}
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
                        className={cartQuantityButton}
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={cartRemoveButton}
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
            <p className={cartEyebrow}>Order summary</p>
            <div className={cartSummaryRow}>
              <span>Subtotal</span>
              <strong>{formatMoney(cartSubtotal)}</strong>
            </div>
            <div className={cartSummaryRow}>
              <span>Ground delivery</span>
              <span>
                {cartShipping.amount === 0
                  ? "Complimentary"
                  : formatMoney(cartShipping)}
              </span>
            </div>
            <div className={cartSummaryTotal}>
              <span>Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>
            <p className={cartSummaryNote}>
              {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD
                ? `${formatMoney({
                    amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                    currencyCode: "USD",
                  })} away from free ground delivery.`
                : "Ground delivery is included on this order."}
            </p>
            <p className={demoCartDisabledCta} aria-disabled>
              Checkout — not connected
            </p>
            <p className={cartSummaryNote}>
              This is a demonstration cart held in your browser. No live store,
              payment, or checkout is connected, and nothing here is sent
              anywhere.
            </p>
          </aside>
        </div>
      ) : (
        <div className={cartEmptyState}>
          <div className="max-w-[500px]">
            <h2 className={cartEmptyHeading}>Nothing packed yet.</h2>
            <p className="text-text-muted">
              Build a field system around the weather and miles ahead.
            </p>
            <Link className={demoCartPrimaryCta} href="/shop">
              Explore all gear
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
