"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  type DemoCartLine,
  FREE_SHIPPING_THRESHOLD,
  MAX_LINE_QUANTITY,
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
        : `${line.title} quantity set to ${Math.min(next, MAX_LINE_QUANTITY)}.`,
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
    <div>
      {/* Cart status changes are announced without stealing focus. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      <header>
        <p className="field-label text-clay">Your field bag · demo only</p>
        <h1 className="display-huge mt-4 text-carbon">
          Cart
          {hydrated && lines.length > 0
            ? ` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
            : ""}
        </h1>
      </header>

      {!hydrated ? (
        <p className="field-label mt-10 border-y border-hairline py-10 text-center text-slate">
          Opening the cart…
        </p>
      ) : lines.length === 0 ? (
        <div className="mt-10 max-w-2xl border-t-2 border-carbon pt-8">
          <p className="display-large text-carbon">The pack is empty.</p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate">
            Nothing staged for the next trip yet. The catalog is short and the
            weather is coming — start with the shell.
          </p>
          <Link
            href="/shop"
            className="field-label mt-8 inline-flex min-h-11 items-center bg-carbon px-6 text-cream transition-colors hover:bg-acid hover:text-carbon"
          >
            Shop the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
          <ul className="divide-y divide-hairline border-y border-hairline lg:col-span-8">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-6 py-8">
                <Link href={line.href} className="shrink-0">
                  <Image
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="112px"
                    className="aspect-4/5 w-24 border border-hairline object-cover sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-wrap content-start gap-x-6 gap-y-4">
                  <div className="min-w-40 flex-1">
                    <h3 className="font-display text-2xl text-carbon">
                      <Link href={line.href} className="hover:text-pine">
                        {line.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-slate">
                      {line.colorwayName}
                      {line.size !== undefined ? ` · ${line.size}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      <fieldset className="min-w-0">
                        <legend className="sr-only">
                          Quantity for {line.title}
                        </legend>
                        <div className="flex items-center border border-carbon/50">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${line.title}`}
                            onClick={() =>
                              updateQuantity(line, line.quantity - 1)
                            }
                            className="inline-flex size-11 items-center justify-center text-carbon transition-colors hover:bg-parchment"
                          >
                            −
                          </button>
                          <span
                            aria-live="polite"
                            className="field-label w-10 text-center text-carbon"
                          >
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${line.title}`}
                            onClick={() =>
                              updateQuantity(line, line.quantity + 1)
                            }
                            className="inline-flex size-11 items-center justify-center text-carbon transition-colors hover:bg-parchment"
                          >
                            +
                          </button>
                        </div>
                      </fieldset>
                      <button
                        type="button"
                        onClick={() => remove(line)}
                        className="field-label inline-flex min-h-11 items-center text-slate underline decoration-hairline underline-offset-4 transition-colors hover:text-carbon"
                      >
                        Remove
                        <span className="sr-only"> {line.title} from cart</span>
                      </button>
                    </div>
                  </div>
                  <p className="ml-auto self-start text-base text-carbon">
                    {formatMoney({
                      amount: line.unitPrice.amount * line.quantity,
                      currencyCode: "USD",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside aria-label="Order summary" className="lg:col-span-4">
            <div className="bg-acid px-6 py-6 text-carbon">
              <h2 className="field-label">
                Order summary · {itemCount} {itemCount === 1 ? "item" : "items"}
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-carbon/25 pb-3">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(cartSubtotal)}</dd>
                </div>
                <div className="flex justify-between border-b border-carbon/25 pb-3">
                  <dt>Ground delivery</dt>
                  <dd>
                    {cartShipping.amount === 0
                      ? "Complimentary"
                      : formatMoney(cartShipping)}
                  </dd>
                </div>
                {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD ? (
                  <p className="text-xs">
                    {formatMoney({
                      amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                      currencyCode: "USD",
                    })}{" "}
                    away from free shipping.
                  </p>
                ) : null}
                <div className="flex items-baseline justify-between pt-2 font-display text-3xl">
                  <dt>Total</dt>
                  <dd>{formatMoney(cartTotal)}</dd>
                </div>
              </dl>
              <p
                aria-disabled="true"
                className="field-label mt-6 flex min-h-11 cursor-not-allowed items-center justify-center bg-carbon/15 text-carbon/70"
              >
                Checkout — not connected
              </p>
              <p className="mt-4 text-xs leading-relaxed">
                This is a demonstration cart held in your browser. No live
                store, payment, or checkout is connected, and nothing here is
                sent anywhere.
              </p>
            </div>
            <Link
              href="/shop"
              className="field-label mt-5 inline-flex min-h-11 items-center gap-2 text-carbon hover:text-pine"
            >
              Continue shopping →
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
