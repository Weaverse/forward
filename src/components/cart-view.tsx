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

      {!hydrated ? (
        <p className="field-label border-y border-mist py-10 text-center text-slate">
          Opening the cart…
        </p>
      ) : lines.length === 0 ? (
        <div className="border border-mist bg-parchment px-6 py-14 text-center">
          <p className="font-display text-2xl text-pine">The pack is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate">
            Nothing staged for the next trip yet. The catalog is short and the
            weather is coming — start with the shell.
          </p>
          <Link
            href="/shop"
            className="field-label mt-6 inline-flex min-h-11 items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
          >
            Shop the catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-12">
          <ul className="divide-y divide-mist border-y border-mist lg:col-span-8">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-5 py-6">
                <Link href={line.href} className="shrink-0">
                  <Image
                    src={line.image.src}
                    alt={line.image.alt}
                    width={line.image.width}
                    height={line.image.height}
                    sizes="112px"
                    className="aspect-4/5 w-24 border border-mist object-cover sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-wrap content-start gap-x-6 gap-y-3">
                  <div className="min-w-40 flex-1">
                    <h3 className="font-display text-lg text-pine">
                      <Link href={line.href} className="hover:text-clay">
                        {line.title}
                      </Link>
                    </h3>
                    <p className="field-label mt-1 text-slate">
                      {line.colorwayName}
                      {line.size !== undefined ? ` · ${line.size}` : ""}
                    </p>
                    <p className="field-label mt-1 text-ink">
                      {formatMoney(line.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <fieldset className="min-w-0">
                      <legend className="sr-only">
                        Quantity for {line.title}
                      </legend>
                      <div className="flex items-center border border-mist">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.title}`}
                          onClick={() =>
                            updateQuantity(line, line.quantity - 1)
                          }
                          className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:bg-parchment"
                        >
                          −
                        </button>
                        <span
                          aria-live="polite"
                          className="field-label w-10 text-center text-ink"
                        >
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.title}`}
                          onClick={() =>
                            updateQuantity(line, line.quantity + 1)
                          }
                          className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:bg-parchment"
                        >
                          +
                        </button>
                      </div>
                    </fieldset>
                    <button
                      type="button"
                      onClick={() => remove(line)}
                      className="field-label inline-flex min-h-11 items-center text-slate underline decoration-mist underline-offset-4 transition-colors hover:text-clay-deep"
                    >
                      Remove
                      <span className="sr-only"> {line.title} from cart</span>
                    </button>
                  </div>
                  <p className="field-label ml-auto self-start text-ink">
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
            <div className="border border-mist bg-parchment px-5 py-5">
              <h2 className="field-label text-ink">
                Summary · {itemCount} {itemCount === 1 ? "item" : "items"}
              </h2>
              <dl className="mt-4 space-y-2 text-sm text-slate">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-ink">{formatMoney(cartSubtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-ink">
                    {cartShipping.amount === 0
                      ? "Free"
                      : formatMoney(cartShipping)}
                  </dd>
                </div>
                {cartSubtotal.amount < FREE_SHIPPING_THRESHOLD ? (
                  <p className="text-xs text-moss">
                    {formatMoney({
                      amount: FREE_SHIPPING_THRESHOLD - cartSubtotal.amount,
                      currencyCode: "USD",
                    })}{" "}
                    away from free shipping.
                  </p>
                ) : null}
                <div className="flex justify-between border-t border-mist pt-3 font-display text-lg text-ink">
                  <dt>Total</dt>
                  <dd>{formatMoney(cartTotal)}</dd>
                </div>
              </dl>
              <p
                aria-disabled="true"
                className="field-label mt-5 flex min-h-11 cursor-not-allowed items-center justify-center bg-mist text-slate"
              >
                Checkout — not connected
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate">
                This is a demonstration cart held in your browser. No live
                store, payment, or checkout is connected, and nothing here is
                sent anywhere.
              </p>
            </div>
            <Link
              href="/shop"
              className="field-label mt-4 inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
            >
              Continue shopping →
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
