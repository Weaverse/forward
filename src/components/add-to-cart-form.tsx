"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import {
  ShopifyProductProvider,
  toHydrogenProductInput,
  useShopifyCartMode,
  useShopifyProductForm,
} from "@/lib/cart/shopify-cart-react";
import { lineKey, MAX_LINE_QUANTITY } from "@/lib/demo-cart/cart-logic";
import { addCartLine } from "@/lib/demo-cart/store";
import { formatMoney } from "@/lib/storefront/format";
import { productColorwayHref } from "@/lib/storefront/product-state";
import type { Product, ProductColorway } from "@/lib/storefront/types";

interface AddToCartFormProps {
  product: Product;
  colorway: ProductColorway;
}

/**
 * Canonical size `.option-group`, `.product-actions`, and `.add-feedback`
 * (source `app.js:284–285`).
 *
 * Behavior stays Forward-owned: the canonical prototype adds to a global
 * object and opens a fake drawer, while this writes to the browser-local demo
 * cart with the existing quantity limits, line key, and live-region status.
 */
function DemoAddToCartForm({ product, colorway }: AddToCartFormProps) {
  const sizeOption = product.options[0];
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const groupId = useId();

  function handleAdd() {
    if (sizeOption !== undefined && size === undefined) {
      setStatus(`Choose a ${sizeOption.name.toLowerCase()} first.`);
      return;
    }
    addCartLine({
      key: lineKey(product.handle, colorway.id, size),
      productHandle: product.handle,
      title: product.title,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      size,
      quantity,
      unitPrice: product.price,
      image: colorway.images.primary,
      href: productColorwayHref(product, colorway.id),
    });
    setStatus(
      `Added ${quantity} × ${product.title} (${colorway.name}${
        size !== undefined ? `, ${size}` : ""
      }) to the demo cart.`,
    );
  }

  return (
    <>
      {sizeOption !== undefined ? (
        <fieldset className="option-group">
          <legend className="sr-only">{sizeOption.name}</legend>
          <div className="option-label">
            <span>{sizeOption.name}</span>
            <span>{size ?? "Select"}</span>
          </div>
          <div className="option-row">
            {sizeOption.values.map((value) => {
              const selected = size === value;
              return (
                <label
                  key={value}
                  className={cn("option-chip", selected && "selected")}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name={`${groupId}-size`}
                    value={value}
                    checked={selected}
                    onChange={() => {
                      setSize(value);
                      setStatus("");
                    }}
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="product-actions">
        <div className="quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <output aria-live="polite" aria-label="Quantity">
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
          >
            +
          </button>
        </div>
        <button
          className="button button-signal"
          type="button"
          onClick={handleAdd}
        >
          Add to cart ·{" "}
          {formatMoney({
            amount: product.price.amount * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className="add-feedback" role="status">
        {status}
      </p>
      <p className="demo-note">
        Demo cart only — items stay in this browser and no checkout is
        connected.
      </p>
    </>
  );
}

function ShopifyAddToCartForm({ product }: AddToCartFormProps) {
  const { formProps, options, pending, register, selectedVariant } =
    useShopifyProductForm();
  const [quantity, setQuantity] = useState(1);
  const selectedPrice = Number(
    selectedVariant?.price.amount ?? product.price.amount,
  );

  return (
    <form {...formProps()}>
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: quantity })} />
      {options.map((option) => {
        if (option.name.toLowerCase() === "color") return null;
        const selected = option.values.find((value) => value.selected)?.name;
        return (
          <fieldset className="option-group" key={option.name}>
            <legend className="sr-only">{option.name}</legend>
            <div className="option-label">
              <span>{option.name}</span>
              <span>{selected ?? "Unavailable"}</span>
            </div>
            <div className="option-row">
              {option.values.map((value) => (
                <button
                  {...register("optionValue", {
                    optionName: option.name,
                    value: value.name,
                  })}
                  aria-pressed={value.selected}
                  className={cn("option-chip", value.selected && "selected")}
                  disabled={!value.available}
                  key={value.name}
                  type="button"
                >
                  {value.name}
                </button>
              ))}
            </div>
          </fieldset>
        );
      })}

      <div className="product-actions">
        <div className="quantity">
          <button
            aria-label="Decrease quantity"
            disabled={pending || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            −
          </button>
          <output aria-live="polite" aria-label="Quantity">
            {quantity}
          </output>
          <button
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
          className="button button-signal"
          disabled={
            pending ||
            selectedVariant === null ||
            !selectedVariant.availableForSale
          }
        >
          {pending ? "Adding…" : "Add to cart"} ·{" "}
          {formatMoney({
            amount: selectedPrice * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className="add-feedback" role="status" aria-live="polite">
        {pending ? "Updating your cart…" : ""}
      </p>
      <p className="demo-note">
        Secure Shopify cart. Checkout is handed off to Shopify; no payment runs
        on this page.
      </p>
    </form>
  );
}

export function AddToCartForm(props: AddToCartFormProps) {
  return useShopifyCartMode() ? (
    <ShopifyProductProvider
      product={toHydrogenProductInput(props.product, props.colorway.id)}
    >
      <ShopifyAddToCartForm {...props} />
    </ShopifyProductProvider>
  ) : (
    <DemoAddToCartForm {...props} />
  );
}
