"use client";

import Image from "next/image";
import Link from "next/link";

import {
  formatShopifyMoney as money,
  type ShopifyCartLineData,
  useShopifyCart,
  useShopifyCartForm,
} from "@/lib/cart/shopify-cart-react";

import {
  shopifyCartDisabledCta,
  shopifyCartPrimaryCta,
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
    <article className={cartLine}>
      <Link href={href}>
        {image === null || image === undefined ? null : (
          <Image
            alt={image.altText ?? title}
            className={cartImage}
            height={image.height ?? 240}
            sizes="190px"
            src={image.url}
            width={image.width ?? 190}
          />
        )}
      </Link>
      <div>
        <h2 className={cartLineHeading}>
          <Link href={href}>{title}</Link>
        </h2>
        {details === undefined || details.length === 0 ? null : (
          <p className="text-text-muted">{details}</p>
        )}
        <form {...formProps()} className={cartLineControls}>
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className={cartQuantity}>
            <button
              {...register("decrease")}
              aria-label={`Decrease quantity of ${title}`}
              className={cartQuantityButton}
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
              className={cartQuantityButton}
              disabled={pending}
              type="submit"
            >
              +
            </button>
          </div>
          <button
            {...register("remove")}
            className={cartRemoveButton}
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
    <div className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter pt-[105px] pb-[clamp(56px,8vw,110px)]">
      <p aria-live="polite" className="sr-only" role="status">
        {errorMessages.join(" ")}
      </p>
      <p className={cartEyebrow}>Your field bag · live Shopify cart</p>
      <h1 className={cartPageHeading}>
        Cart · {cart.totalQuantity}{" "}
        {cart.totalQuantity === 1 ? "item" : "items"}
      </h1>

      {lines.length > 0 ? (
        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] gap-[clamp(40px,8vw,110px)] py-[clamp(42px,6vw,84px)] max-md:grid-cols-1">
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
            <p className={cartEyebrow}>Order summary</p>
            <div className={cartSummaryRow}>
              <span>Subtotal</span>
              <strong>{money(cart.cost.subtotalAmount)}</strong>
            </div>
            <div className={cartSummaryRow}>
              <span>Delivery</span>
              <span>Calculated by Shopify at checkout</span>
            </div>
            <div className={cartSummaryTotal}>
              <span>Total</span>
              <strong>{money(cart.cost.totalAmount)}</strong>
            </div>
            {cart.checkoutUrl === null || cart.checkoutUrl === undefined ? (
              <p aria-disabled className={shopifyCartDisabledCta}>
                Checkout unavailable
              </p>
            ) : (
              <a
                className={`${shopifyCartPrimaryCta} w-full`}
                href={cart.checkoutUrl}
                rel="external nofollow"
              >
                Checkout securely with Shopify
              </a>
            )}
            <p className={cartSummaryNote}>
              Checkout is a validated handoff to Shopify. Forward does not
              collect payment details on this page.
            </p>
            {errorMessages.length === 0 ? null : (
              <div className={cartSummaryNote} role="alert">
                {errorMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className={cartEmptyState}>
          <div className="max-w-[500px]">
            <h2 className={cartEmptyHeading}>Nothing packed yet.</h2>
            <p className="text-text-muted">
              Build a field system around the weather and miles ahead.
            </p>
            <Link className={shopifyCartPrimaryCta} href="/shop">
              Explore all gear
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
