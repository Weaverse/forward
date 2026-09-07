"use client";

import Image from "next/image";
import Link from "next/link";

import {
  formatShopifyMoney as money,
  type ShopifyCartLineData,
  useShopifyCart,
  useShopifyCartForm,
} from "@/lib/cart/shopify-cart-react";
import { cn } from "@/lib/cn";

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

function ShopifyCartLine({
  line,
  pending,
}: {
  line: ShopifyCartLineData;
  pending: boolean;
}) {
  const { formProps, register } = useShopifyCartForm();
  const title = line.merchandise?.product.title ?? "Forward gear";
  const handle = line.merchandise?.product.handle;
  const href = handle === undefined ? "/shop" : `/products/${handle}`;
  const details = line.merchandise?.selectedOptions
    ?.map(({ value }) => value)
    .join(" · ");
  const image = line.merchandise?.image;

  return (
    <article className={CART_LINE}>
      <Link href={href}>
        {image === null || image === undefined ? null : (
          <Image
            alt={image.altText ?? title}
            className={CART_IMAGE}
            height={image.height ?? 240}
            sizes="190px"
            src={image.url}
            width={image.width ?? 190}
          />
        )}
      </Link>
      <div>
        <h2 className={CART_LINE_HEADING}>
          <Link href={href}>{title}</Link>
        </h2>
        {details === undefined || details.length === 0 ? null : (
          <p className="text-text-muted">{details}</p>
        )}
        <form {...formProps()} className={CART_LINE_CONTROLS}>
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className={CART_QUANTITY}>
            <button
              {...register("decrease")}
              aria-label={`Decrease quantity of ${title}`}
              className={CART_QUANTITY_BUTTON}
              disabled={pending}
              type="submit"
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
              {...register("increase")}
              aria-label={`Increase quantity of ${title}`}
              className={CART_QUANTITY_BUTTON}
              disabled={pending}
              type="submit"
            >
              +
            </button>
          </div>
          <button
            {...register("remove")}
            className={CART_REMOVE_BUTTON}
            disabled={pending}
            type="submit"
          >
            Remove
            <span className="sr-only"> {title} from cart</span>
          </button>
        </form>
      </div>
      <div className="font-bold whitespace-nowrap max-sm:col-start-2">
        {money(line.cost.totalAmount)}
      </div>
    </article>
  );
}

export function ShopifyCartView() {
  const cart = useShopifyCart((state) => state.data);
  const errors = useShopifyCart((state) => state.errors);
  const pendingLines = useShopifyCart((state) => state.pending.lines);
  const lines = cart.lines.nodes;
  const errorMessages = [
    ...errors.cart.userErrors.map(({ message }) => message),
    ...errors.cart.warnings.map(({ message }) => message),
    ...errors.network.map(({ message }) => message),
    ...Array.from(errors.lines.values()).flatMap((group) => [
      ...group.userErrors.map(({ message }) => message),
      ...group.warnings.map(({ message }) => message),
    ]),
  ];

  return (
    <div className="mx-auto w-full max-w-page px-page-gutter pt-26.25 pb-section-block-bottom">
      <p aria-live="polite" className="sr-only" role="status">
        {errorMessages.join(" ")}
      </p>
      <p className={CART_EYEBROW}>Your field bag · live Shopify cart</p>
      <h1 className={CART_PAGE_HEADING}>
        Cart · {cart.totalQuantity}{" "}
        {cart.totalQuantity === 1 ? "item" : "items"}
      </h1>

      {lines.length > 0 ? (
        <div className="grid grid-cols-cart gap-feature-gap py-section-block-compact max-md:grid-cols-1">
          <section
            aria-label="Cart items"
            className="border-border-subtle border-t"
          >
            {lines.map((line) => (
              <ShopifyCartLine
                key={line.id}
                line={line}
                pending={pendingLines.has(line.id)}
              />
            ))}
          </section>
          <aside
            aria-label="Order summary"
            className="self-start bg-signal p-7 text-ink"
          >
            <p className={CART_EYEBROW}>Order summary</p>
            <div className={CART_SUMMARY_ROW}>
              <span>Subtotal</span>
              <strong>{money(cart.cost.subtotalAmount)}</strong>
            </div>
            <div className={CART_SUMMARY_ROW}>
              <span>Delivery</span>
              <span>Calculated by Shopify at checkout</span>
            </div>
            <div className={CART_SUMMARY_TOTAL}>
              <span>Total</span>
              <strong>{money(cart.cost.totalAmount)}</strong>
            </div>
            {cart.checkoutUrl === null || cart.checkoutUrl === undefined ? (
              <p aria-disabled className={CART_DISABLED_CTA}>
                Checkout unavailable
              </p>
            ) : (
              <a
                className={cn(CART_PRIMARY_CTA, "w-full")}
                href={cart.checkoutUrl}
                rel="external nofollow"
              >
                Checkout securely with Shopify
              </a>
            )}
            <p className={CART_SUMMARY_NOTE}>
              Checkout is a validated handoff to Shopify. Forward does not
              collect payment details on this page.
            </p>
            {errorMessages.length === 0 ? null : (
              <div className={CART_SUMMARY_NOTE} role="alert">
                {errorMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
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
