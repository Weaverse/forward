"use client";

import Image from "next/image";
import Link from "next/link";

import {
  formatShopifyMoney as money,
  type ShopifyCartLineData,
  useShopifyCart,
  useShopifyCartForm,
} from "@/lib/cart/shopify-cart-react";

const EYEBROW_CLASS =
  "mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase";
const CART_LINE_CLASS =
  "grid grid-cols-[190px_1fr_auto] gap-6 border-border-subtle border-b py-[22px] max-sm:grid-cols-[92px_1fr] max-sm:gap-3.5";
const CART_IMAGE_CLASS =
  "aspect-[4/5] w-[190px] object-cover saturate-[0.72] max-sm:w-[92px]";
const LINE_CONTROLS_CLASS =
  "mt-[18px] flex items-center gap-[15px] max-sm:flex-col max-sm:items-start";
const QUANTITY_CLASS =
  "grid h-11 w-28 grid-cols-[36px_1fr_36px] border border-border-dark-strong max-sm:h-12";
const QUANTITY_BUTTON_CLASS =
  "bg-transparent text-[20px] hover:bg-signal hover:text-ink";
const SUMMARY_ROW_CLASS =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
const SUMMARY_NOTE_CLASS = "mt-[14px] mb-5 text-[12px] text-text-muted";
const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0";
const EMPTY_STATE_CLASS =
  "grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center";

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
    <article className={CART_LINE_CLASS}>
      <Link href={href}>
        {image === null || image === undefined ? null : (
          <Image
            alt={image.altText ?? title}
            className={CART_IMAGE_CLASS}
            height={image.height ?? 240}
            sizes="190px"
            src={image.url}
            width={image.width ?? 190}
          />
        )}
      </Link>
      <div>
        <h2 className="m-0 mb-1 text-balance font-heading text-[31px] font-medium">
          <Link href={href}>{title}</Link>
        </h2>
        {details === undefined || details.length === 0 ? null : (
          <p className="text-text-muted">{details}</p>
        )}
        <form {...formProps()} className={LINE_CONTROLS_CLASS}>
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className={QUANTITY_CLASS}>
            <button
              {...register("decrease")}
              aria-label={`Decrease quantity of ${title}`}
              className={QUANTITY_BUTTON_CLASS}
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
              className={QUANTITY_BUTTON_CLASS}
              disabled={pending}
              type="submit"
            >
              +
            </button>
          </div>
          <button
            {...register("remove")}
            className="min-h-touch bg-transparent text-[11px] text-text-muted underline underline-offset-[3px]"
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
      <p className={EYEBROW_CLASS}>Your field bag · live Shopify cart</p>
      <h1 className="m-0 text-balance font-heading text-display leading-[0.94] font-medium tracking-heading">
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
            <p className={EYEBROW_CLASS}>Order summary</p>
            <div className={SUMMARY_ROW_CLASS}>
              <span>Subtotal</span>
              <strong>{money(cart.cost.subtotalAmount)}</strong>
            </div>
            <div className={SUMMARY_ROW_CLASS}>
              <span>Delivery</span>
              <span>Calculated by Shopify at checkout</span>
            </div>
            <div
              className={`${SUMMARY_ROW_CLASS} py-5 font-heading text-[27px]`}
            >
              <span>Total</span>
              <strong>{money(cart.cost.totalAmount)}</strong>
            </div>
            {cart.checkoutUrl === null || cart.checkoutUrl === undefined ? (
              <p
                aria-disabled
                className={`${PRIMARY_BUTTON_CLASS} w-full cursor-not-allowed opacity-[0.46] shadow-none`}
              >
                Checkout unavailable
              </p>
            ) : (
              <a
                className={`${PRIMARY_BUTTON_CLASS} w-full`}
                href={cart.checkoutUrl}
                rel="external nofollow"
              >
                Checkout securely with Shopify
              </a>
            )}
            <p className={SUMMARY_NOTE_CLASS}>
              Checkout is a validated handoff to Shopify. Forward does not
              collect payment details on this page.
            </p>
            {errorMessages.length === 0 ? null : (
              <div className={SUMMARY_NOTE_CLASS} role="alert">
                {errorMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
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
