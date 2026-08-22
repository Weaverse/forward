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

const EYEBROW_CLASS =
  "mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase";
const PAGE_HEADING_CLASS =
  "m-0 text-balance font-heading text-display leading-[0.94] font-medium tracking-heading";
const CART_LINE_CLASS =
  "grid grid-cols-[190px_1fr_auto] gap-6 border-border-subtle border-b py-[22px] max-sm:grid-cols-[92px_1fr] max-sm:gap-3.5";
const CART_IMAGE_CLASS =
  "aspect-[4/5] w-[190px] object-cover saturate-[0.72] max-sm:w-[92px]";
const LINE_HEADING_CLASS =
  "m-0 mb-1 text-balance font-heading text-[31px] font-medium";
const LINE_CONTROLS_CLASS =
  "mt-[18px] flex items-center gap-[15px] max-sm:flex-col max-sm:items-start";
const QUANTITY_CLASS =
  "grid h-11 w-28 grid-cols-[36px_1fr_36px] border border-border-dark-strong max-sm:h-12";
const QUANTITY_BUTTON_CLASS =
  "bg-transparent text-[20px] hover:bg-signal hover:text-ink";
const REMOVE_BUTTON_CLASS =
  "min-h-touch bg-transparent text-[11px] text-text-muted underline underline-offset-[3px]";
const SUMMARY_ROW_CLASS =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
const SUMMARY_NOTE_CLASS = "mt-[14px] mb-5 text-[12px] text-text-muted";
const BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border px-[22px] py-3 font-body text-[11px] font-bold tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-ink hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0";
const PRIMARY_BUTTON_CLASS = `${BUTTON_CLASS} border-ink bg-ink text-text-inverse shadow-[4px_4px_0_var(--color-signal)] hover:shadow-[2px_2px_0_var(--color-signal)] focus-visible:outline-signal`;
const EMPTY_STATE_CLASS =
  "grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center";

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
      <p className={EYEBROW_CLASS}>Your field bag · demo only</p>
      <h1 className={PAGE_HEADING_CLASS}>
        Cart
        {hydrated
          ? ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
          : ""}
      </h1>

      {!hydrated ? (
        <div className={EMPTY_STATE_CLASS}>
          <div className="max-w-[500px]">
            <p className={EYEBROW_CLASS}>Opening the cart…</p>
          </div>
        </div>
      ) : lines.length > 0 ? (
        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] gap-[clamp(40px,8vw,110px)] py-[clamp(42px,6vw,84px)] max-md:grid-cols-1">
          <section
            className="border-border-subtle border-t"
            aria-label="Cart items"
          >
            {lines.map((line) => (
              <article key={line.key} className={CART_LINE_CLASS}>
                <Link href={line.href}>
                  <Image
                    className={CART_IMAGE_CLASS}
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="190px"
                  />
                </Link>
                <div>
                  <h2 className={LINE_HEADING_CLASS}>
                    <Link href={line.href}>{line.title}</Link>
                  </h2>
                  <p className="text-text-muted">
                    {[
                      line.colorwayName,
                      ...Object.values(line.selectedOptions),
                    ].join(" · ")}
                  </p>
                  <div className={LINE_CONTROLS_CLASS}>
                    {/* Each control names its own line, so the quantity group
                        needs no wrapper role. */}
                    <div className={QUANTITY_CLASS}>
                      <button
                        className={QUANTITY_BUTTON_CLASS}
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
                        className={QUANTITY_BUTTON_CLASS}
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        onClick={() => updateQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={REMOVE_BUTTON_CLASS}
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
            <p className={EYEBROW_CLASS}>Order summary</p>
            <div className={SUMMARY_ROW_CLASS}>
              <span>Subtotal</span>
              <strong>{formatMoney(cartSubtotal)}</strong>
            </div>
            <div className={SUMMARY_ROW_CLASS}>
              <span>Ground delivery</span>
              <span>
                {cartShipping.amount === 0
                  ? "Complimentary"
                  : formatMoney(cartShipping)}
              </span>
            </div>
            <div
              className={`${SUMMARY_ROW_CLASS} py-5 font-heading text-[27px]`}
            >
              <span>Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>
            <p className={SUMMARY_NOTE_CLASS}>
              {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD
                ? `${formatMoney({
                    amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                    currencyCode: "USD",
                  })} away from free ground delivery.`
                : "Ground delivery is included on this order."}
            </p>
            <p
              className={`${PRIMARY_BUTTON_CLASS} w-full cursor-not-allowed opacity-[0.46] shadow-none`}
              aria-disabled
            >
              Checkout — not connected
            </p>
            <p className={SUMMARY_NOTE_CLASS}>
              This is a demonstration cart held in your browser. No live store,
              payment, or checkout is connected, and nothing here is sent
              anywhere.
            </p>
          </aside>
        </div>
      ) : (
        <div className={EMPTY_STATE_CLASS}>
          <div className="max-w-[500px]">
            <h2 className="m-0 mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading">
              Nothing packed yet.
            </h2>
            <p className="text-text-muted">
              Build a field system around the weather and miles ahead.
            </p>
            <Link className={PRIMARY_BUTTON_CLASS} href="/shop">
              Explore all gear
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
