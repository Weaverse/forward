"use client";

import { cva } from "class-variance-authority";
import { Link } from "@/components/link";
import { useT } from "@/lib/i18n/t";
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
  const t = useT();
  const state = useMainProduct();
  if (state === null) return null;
  const { product, selection, currentParams } = state;
  const { colorway } = selection;
  const label = colorLabel || t("product.color");

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
                aria-label={[
                  t("product.colorway", { name: entry.name }),
                  selected ? t("product.selected") : "",
                  soldOut ? t("product.soldOutSuffix") : "",
                ]
                  .filter((part) => part !== "")
                  .join(" ")}
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
              /* No variant has this combination: there is nothing to show. */
              if (exact === undefined) {
                return (
                  <span
                    key={value}
                    className={optionChip({
                      interactive: false,
                      selected,
                      soldOut: false,
                    })}
                    aria-disabled="true"
                    title={t("product.unavailable", { value })}
                  >
                    {value}
                  </span>
                );
              }
              /* A sold-out variant stays selectable, so a shopper can see it;
               * the add-to-cart button is what says it cannot be bought. */
              const soldOut = !exact.availableForSale;
              return (
                <Link
                  key={value}
                  className={optionChip({
                    interactive: true,
                    selected,
                    soldOut,
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
                  {soldOut ? (
                    <span className="sr-only">
                      {" "}
                      {t("product.soldOutSuffix")}
                    </span>
                  ) : null}
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
