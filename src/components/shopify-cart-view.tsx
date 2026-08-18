"use client";

import Image from "next/image";
import Link from "next/link";

import {
  formatShopifyMoney as money,
  type ShopifyCartLineData,
  useShopifyCart,
  useShopifyCartForm,
} from "@/lib/cart/shopify-cart-react";

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
    <article className="cart-line">
      <Link href={href}>
        {image === null || image === undefined ? null : (
          <Image
            alt={image.altText ?? title}
            height={image.height ?? 240}
            sizes="190px"
            src={image.url}
            width={image.width ?? 190}
          />
        )}
      </Link>
      <div>
        <h2>
          <Link href={href}>{title}</Link>
        </h2>
        {details === undefined || details.length === 0 ? null : (
          <p className="muted">{details}</p>
        )}
        <form {...formProps()} className="line-controls">
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className="quantity">
            <button
              {...register("decrease")}
              aria-label={`Decrease quantity of ${title}`}
              disabled={pending}
              type="submit"
            >
              −
            </button>
            <output aria-live="polite">{line.quantity}</output>
            <button
              {...register("increase")}
              aria-label={`Increase quantity of ${title}`}
              disabled={pending}
              type="submit"
            >
              +
            </button>
          </div>
          <button
            {...register("remove")}
            className="remove-button"
            disabled={pending}
            type="submit"
          >
            Remove
            <span className="sr-only"> {title} from cart</span>
          </button>
        </form>
      </div>
      <div className="line-price">{money(line.cost.totalAmount)}</div>
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
    <div className="shell cart-page">
      <p aria-live="polite" className="sr-only" role="status">
        {errorMessages.join(" ")}
      </p>
      <p className="eyebrow">Your field bag · live Shopify cart</p>
      <h1 className="h1">
        Cart · {cart.totalQuantity}{" "}
        {cart.totalQuantity === 1 ? "item" : "items"}
      </h1>

      {lines.length > 0 ? (
        <div className="cart-layout section-tight">
          <section aria-label="Cart items" className="cart-list">
            {lines.map((line) => (
              <ShopifyCartLine
                key={line.id}
                line={line}
                pending={pendingLines.has(line.id)}
              />
            ))}
          </section>
          <aside aria-label="Order summary" className="order-summary">
            <p className="eyebrow">Order summary</p>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(cart.cost.subtotalAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>Calculated by Shopify at checkout</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{money(cart.cost.totalAmount)}</strong>
            </div>
            {cart.checkoutUrl === null || cart.checkoutUrl === undefined ? (
              <p aria-disabled className="button button-primary button-block">
                Checkout unavailable
              </p>
            ) : (
              <a
                className="button button-primary button-block"
                href={cart.checkoutUrl}
                rel="external nofollow"
              >
                Checkout securely with Shopify
              </a>
            )}
            <p className="summary-note">
              Checkout is a validated handoff to Shopify. Forward does not
              collect payment details on this page.
            </p>
            {errorMessages.length === 0 ? null : (
              <div className="summary-note" role="alert">
                {errorMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
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
