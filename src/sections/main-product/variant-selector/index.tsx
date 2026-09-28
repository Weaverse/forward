"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";

import {
  colorwayIsSoldOut,
  colorwaySwatchStyle,
  findExactVariant,
  productSelectionHref,
  resolveProductSelection,
} from "@/lib/storefront/product-state";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

const optionChip = cva(
  "relative inline-flex min-h-touch min-w-12 items-center justify-center gap-2 border px-3.5 py-2 font-body text-caption font-bold",
  {
    variants: {
      interactive: {
        true: "hover:border-signal hover:bg-signal hover:text-ink",
        false: "cursor-not-allowed text-text-dark-muted",
      },
      selected: {
        true: "border-signal bg-signal",
        false: "border-border-dark-strong bg-transparent",
      },
      soldOut: {
        true: "line-through",
        false: null,
      },
    },
    compoundVariants: [
      { interactive: true, selected: true, className: "text-ink" },
      {
        interactive: true,
        selected: false,
        className: "text-text-inverse",
      },
    ],
  },
);

const OPTION_HEADER_CLASS =
  "mb-2.5 flex justify-between font-body text-micro font-medium tracking-control uppercase";

interface ProductVariantSelectorProps extends WeaverseElementProps {
  colorLabel?: string;
  showSwatches?: boolean;
  showSelectedValue?: boolean;
}

/**
 * Colorway and option chips.
 *
 * Every chip is a link to the selection it would make, so choosing is a
 * navigation the section's URL state follows, and a sold-out value stays
 * visible and current but is not a link.
 */
function ProductVariantSelector({
  colorLabel,
  showSwatches,
  showSelectedValue,
  ...rest
}: ProductVariantSelectorProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product, selection, currentParams } = state;
  const { colorway } = selection;
  const label = colorLabel || "Color";

  return (
    <div {...elementAttributes(rest)}>
      <fieldset className="my-6">
        <legend className="sr-only">{label}</legend>
        <div className={OPTION_HEADER_CLASS}>
          <span>{label}</span>
          {showSelectedValue === false ? null : <span>{colorway.name}</span>}
        </div>
        <div className="flex flex-wrap gap-1.75">
          {product.colorways.map((entry) => {
            const next = resolveProductSelection(
              product,
              entry.id,
              selection.selectedOptions,
            );
            const selected = entry.id === colorway.id;
            const soldOut = colorwayIsSoldOut(product, entry.id);
            return (
              <Link
                key={entry.id}
                className={optionChip({
                  interactive: true,
                  selected,
                  soldOut,
                })}
                href={productSelectionHref(
                  product,
                  next.colorway.id,
                  next.selectedOptions,
                  currentParams,
                )}
                scroll={false}
                aria-label={`${entry.name} colorway${selected ? " (selected)" : ""}${soldOut ? " (sold out)" : ""}`}
                aria-current={selected ? "true" : undefined}
              >
                {showSwatches === false ? null : (
                  <span
                    aria-hidden="true"
                    className="size-3 border border-white/40"
                    style={colorwaySwatchStyle(entry)}
                  />
                )}
                {entry.name}
              </Link>
            );
          })}
        </div>
      </fieldset>

      {product.options.map((option) => (
        <fieldset className="my-6" key={option.name}>
          <legend className="sr-only">{option.name}</legend>
          <div className={OPTION_HEADER_CLASS}>
            <span>{option.name}</span>
            {showSelectedValue === false ? null : (
              <span>{selection.selectedOptions[option.name]}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.75">
            {option.values.map((value) => {
              const nextOptions = {
                ...selection.selectedOptions,
                [option.name]: value,
              };
              const exact = findExactVariant(product, colorway.id, nextOptions);
              const selected = selection.selectedOptions[option.name] === value;
              if (exact === undefined || !exact.availableForSale) {
                return (
                  <span
                    key={value}
                    className={optionChip({
                      interactive: false,
                      selected,
                      soldOut: true,
                    })}
                    aria-disabled="true"
                    aria-current={selected ? "true" : undefined}
                    title={`${value} is unavailable`}
                  >
                    {value}
                    <span className="sr-only"> (sold out)</span>
                  </span>
                );
              }
              return (
                <Link
                  key={value}
                  className={optionChip({
                    interactive: true,
                    selected,
                    soldOut: false,
                  })}
                  href={productSelectionHref(
                    product,
                    colorway.id,
                    nextOptions,
                    currentParams,
                  )}
                  scroll={false}
                  aria-current={selected ? "true" : undefined}
                >
                  {value}
                </Link>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default ProductVariantSelector;

export { schema } from "./schema";
