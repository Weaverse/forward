"use client";

import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import { announceCartAdd } from "@/lib/cart/mini-cart-signal";
import {
  ShopifyProductProvider,
  toHydrogenProductInput,
  useShopifyCart,
  useShopifyCartMode,
  useShopifyProductForm,
} from "@/lib/cart/shopify-cart-react";
import { cn } from "@/lib/cn";
import { lineKey, MAX_LINE_QUANTITY } from "@/lib/demo-cart/cart-logic";
import { addCartLine } from "@/lib/demo-cart/store";
import { cta } from "@/lib/presentation/variants";
import { formatMoney } from "@/lib/storefront/format";
import {
  type ProductSelection,
  productSelectionHref,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

type Surface = "dark" | "light";

interface AddToCartFormProps {
  product: Product;
  selection: ProductSelection;
  /** The surface behind the form: the PDP's ink panel, or a light section. */
  tone?: Surface;
  addToCartText?: string;
  soldOutText?: string;
  /** The line under the buttons saying which cart this is. */
  showCartNote?: boolean;
}

const ACTIONS_CLASS = "mt-7.5 grid grid-cols-1 gap-2 sm:grid-cols-[112px_1fr]";
/* Every colour that has to read against the surface follows `tone`. */
const quantityBox = cva("grid h-12 grid-cols-stepper border sm:h-13", {
  variants: {
    tone: { dark: "border-border-dark-strong", light: "border-ink" },
  },
});
const QUANTITY_BUTTON_CLASS =
  "bg-transparent text-control-lg hover:bg-signal hover:text-ink disabled:text-text-disabled disabled:hover:bg-transparent disabled:hover:text-text-disabled";
const QUANTITY_OUTPUT_CLASS = "grid place-items-center font-bold";
/* The buy button is the shared yellow CTA on a dark panel, plus the disabled
 * state that only a real form needs. */
const ADD_TO_CART_DISABLED_CLASS =
  "disabled:border-control-disabled disabled:bg-control-disabled disabled:text-text-disabled disabled:opacity-46 disabled:shadow-none disabled:hover:border-control-disabled disabled:hover:bg-control-disabled disabled:hover:text-text-disabled disabled:hover:shadow-none";

function addToCartClass(tone: Surface) {
  /* `cta` names its shadow colour, which is the opposite of the surface. */
  return cn(
    cta({ tone: tone === "dark" ? "light" : "dark" }),
    ADD_TO_CART_DISABLED_CLASS,
  );
}
const feedback = cva("mt-3 mb-0 min-h-6 text-caption font-bold", {
  variants: { tone: { dark: "text-signal", light: "text-signal-strong" } },
});
const note = cva(
  "mt-4.5 mb-0 border-signal border-l-2 px-3.5 py-3 font-body text-micro leading-rich-copy tracking-link uppercase",
  {
    variants: {
      tone: { dark: "text-text-dark-muted", light: "text-text-muted" },
    },
  },
);

function DemoAddToCartForm({
  product,
  selection,
  tone = "dark",
  addToCartText = "Add to cart",
  soldOutText = "Sold out",
  showCartNote = true,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const size = selection.selectedOptions.Size;

  function handleAdd() {
    if (!selection.variant.availableForSale) return;
    addCartLine({
      key: lineKey(product.handle, selection.variant.id),
      variantId: selection.variant.id,
      productHandle: product.handle,
      title: product.title,
      colorwayId: selection.colorway.id,
      colorwayName: selection.colorway.name,
      selectedOptions: selection.selectedOptions,
      quantity,
      unitPrice: selection.variant.price,
      image: selection.colorway.images.primary,
      href: productSelectionHref(
        product,
        selection.colorway.id,
        selection.selectedOptions,
      ),
    });
    setStatus(
      `Added ${quantity} × ${product.title} (${selection.colorway.name}${
        size !== undefined ? `, ${size}` : ""
      }) to the demo cart.`,
    );
    announceCartAdd(selection.variant.id);
  }

  return (
    <>
      <div className={ACTIONS_CLASS}>
        <div className={quantityBox({ tone })}>
          <button
            className={QUANTITY_BUTTON_CLASS}
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <output
            className={QUANTITY_OUTPUT_CLASS}
            aria-live="polite"
            aria-label="Quantity"
          >
            {quantity}
          </output>
          <button
            className={QUANTITY_BUTTON_CLASS}
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_LINE_QUANTITY}
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
          >
            +
          </button>
        </div>
        <button
          className={addToCartClass(tone)}
          type="button"
          disabled={!selection.variant.availableForSale}
          onClick={handleAdd}
        >
          {selection.variant.availableForSale ? addToCartText : soldOutText} ·{" "}
          {formatMoney({
            amount: selection.variant.price.amount * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className={feedback({ tone })} role="status">
        {status}
      </p>
      {showCartNote ? (
        <p className={note({ tone })}>
          Demo cart only — items stay in this browser and no checkout is
          connected.
        </p>
      ) : null}
    </>
  );
}

function ShopifyAddToCartForm({
  selection,
  tone = "dark",
  addToCartText = "Add to cart",
  soldOutText = "Sold out",
  showCartNote = true,
}: AddToCartFormProps) {
  const { formProps, pending, register, selectedVariant } =
    useShopifyProductForm();
  const [quantity, setQuantity] = useState(1);
  const cartLines = useShopifyCart((state) => state.data.lines.nodes);
  const submittedVariantRef = useRef<{
    id: string;
    previousQuantity: number;
  } | null>(null);
  const wasPendingRef = useRef(false);
  const selectedPrice = Number(
    selectedVariant?.price.amount ?? selection.variant.price.amount,
  );

  /* The mini-cart only opens once the server-owned cart actually reports the
   * merchandise, so a failed add never announces a success. */
  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    const submitted = submittedVariantRef.current;
    if (!wasPendingRef.current || submitted === null) {
      return;
    }
    const currentQuantity =
      cartLines.find((line) => line.merchandise?.id === submitted.id)
        ?.quantity ?? 0;
    if (currentQuantity <= submitted.previousQuantity) {
      return;
    }
    wasPendingRef.current = false;
    submittedVariantRef.current = null;
    announceCartAdd(submitted.id);
  }, [cartLines, pending]);

  return (
    <form
      {...formProps()}
      onSubmitCapture={() => {
        if (selectedVariant === null) return;
        submittedVariantRef.current = {
          id: selectedVariant.id,
          previousQuantity:
            cartLines.find(
              (line) => line.merchandise?.id === selectedVariant.id,
            )?.quantity ?? 0,
        };
      }}
    >
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: quantity })} />
      <div className={ACTIONS_CLASS}>
        <div className={quantityBox({ tone })}>
          <button
            className={QUANTITY_BUTTON_CLASS}
            aria-label="Decrease quantity"
            disabled={pending || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            −
          </button>
          <output
            className={QUANTITY_OUTPUT_CLASS}
            aria-live="polite"
            aria-label="Quantity"
          >
            {quantity}
          </output>
          <button
            className={QUANTITY_BUTTON_CLASS}
            aria-label="Increase quantity"
            disabled={pending || quantity >= MAX_LINE_QUANTITY}
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
            type="button"
          >
            +
          </button>
        </div>
        <button
          {...register("addToCart", {})}
          className={addToCartClass(tone)}
          disabled={
            pending ||
            selectedVariant === null ||
            !selectedVariant.availableForSale
          }
        >
          {pending
            ? "Adding…"
            : selectedVariant?.availableForSale
              ? addToCartText
              : soldOutText}{" "}
          ·{" "}
          {formatMoney({
            amount: selectedPrice * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className={feedback({ tone })} role="status" aria-live="polite">
        {pending ? "Updating your cart…" : ""}
      </p>
      {showCartNote ? (
        <p className={note({ tone })}>
          Secure Shopify cart. Checkout is handed off to Shopify; no payment
          runs on this page.
        </p>
      ) : null}
    </form>
  );
}

export function AddToCartForm(props: AddToCartFormProps) {
  return useShopifyCartMode() ? (
    <ShopifyProductProvider
      product={toHydrogenProductInput(
        props.product,
        props.selection.colorway.id,
        props.selection.variant.id,
      )}
    >
      <ShopifyAddToCartForm {...props} />
    </ShopifyProductProvider>
  ) : (
    <DemoAddToCartForm {...props} />
  );
}
