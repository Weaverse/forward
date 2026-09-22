"use client";

import { IMAGES_PLACEHOLDERS } from "@weaverse/schema";
import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { AddToCartForm } from "@/components/add-to-cart-form";
import { Section } from "@/components/section";
import { cn } from "@/lib/cn";
import {
  cta,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import { formatMoney } from "@/lib/storefront/format";
import {
  colorwayIsSoldOut,
  colorwaySwatchStyle,
  findExactVariant,
  galleryImages,
  productSelectionHref,
  resolveProductSelection,
  saleCompareAtPrice,
} from "@/lib/storefront/product-state";
import type {
  Product,
  ProductCategory,
  StorefrontImage,
} from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

type ImagePosition = "left" | "right";

interface ProductSpotlightProps extends WeaverseElementProps {
  eyebrowPrefix?: string;
  ctaLabel?: string;
  /** How many of the product's specs to list. */
  specCount?: number;
  imagePosition?: ImagePosition;
  showThumbnails?: boolean;
  /** Resolved by `./loader`; `null` when nothing usable is selected. */
  loaderData?: { product: Product } | null;
}

interface SpotlightContentProps {
  titleId: string;
  eyebrowPrefix?: string;
  ctaLabel?: string;
  specCount?: number;
  imagePosition?: ImagePosition;
  showThumbnails: boolean;
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  shells: "Shells",
  packs: "Packs",
  footwear: "Footwear",
};

const GRID_CLASS =
  "grid grid-cols-1 items-stretch md:min-h-[min(calc(100svh_-_var(--spacing-header)_-_6rem),760px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]";
const PANEL_CLASS =
  "flex min-w-0 flex-col justify-center bg-surface-subtle p-[clamp(28px,5vw,72px)]";
const TITLE_CLASS = cn(sectionHeading(), "md:text-spotlight-title");
const OPTION_LABEL_CLASS =
  "mb-2.5 flex justify-between font-body text-micro font-medium tracking-control uppercase";
const IMAGE_CLASS = "aspect-4/5 w-full bg-media-placeholder object-cover";
/* The preview keeps 4:5 on mobile; on desktop it fills the media column,
 * which stretches to the row, so image and panel always match in height. */
const PREVIEW_CLASS = cn(IMAGE_CLASS, "md:aspect-auto md:h-full");

/* Weaverse placeholder art is SVG on Weaverse's CDN, outside this theme's
 * `remotePatterns`, so it bypasses the optimizer. */
const PLACEHOLDER_THUMBS = [
  IMAGES_PLACEHOLDERS.product_2,
  IMAGES_PLACEHOLDERS.product_14,
  IMAGES_PLACEHOLDERS.product_9,
  IMAGES_PLACEHOLDERS.product_1,
];
const PLACEHOLDER_CHIPS = ["chip-1", "chip-2", "chip-3"];

const mediaColumn = cva(
  "grid min-w-0 content-start gap-3 md:grid-rows-[minmax(0,1fr)] md:content-stretch",
  {
    variants: {
      imagePosition: { left: "", right: "md:order-2" },
      /* Thumbnails sit in a narrow rail beside the preview on desktop, below it
       * on mobile, so they never add to the section's height. */
      thumbnails: {
        true: "md:grid-cols-[88px_minmax(0,1fr)] md:items-start",
        false: "",
      },
    },
    defaultVariants: { imagePosition: "left", thumbnails: false },
  },
);

const optionChip = cva(
  "relative inline-flex min-h-touch min-w-12 cursor-pointer items-center justify-center gap-2 border px-3.5 py-2 font-body text-caption font-bold",
  {
    variants: {
      selected: {
        true: "border-ink bg-ink text-text-inverse",
        false: "border-border-subtle bg-transparent text-ink hover:border-ink",
      },
      soldOut: {
        true: "text-text-muted line-through",
        false: null,
      },
    },
    defaultVariants: { selected: false, soldOut: false },
  },
);

/**
 * One product presented as a compact buy module: a colorway gallery, price,
 * colorway and option selection, and the shared add-to-cart form.
 *
 * Selection lives in component state and never touches the PDP's query
 * state; the details link carries it to the product page instead.
 */
function ProductSpotlight({
  eyebrowPrefix,
  ctaLabel,
  specCount,
  imagePosition,
  showThumbnails = true,
  loaderData,
  ...rest
}: ProductSpotlightProps) {
  const titleId = useId();
  const product = loaderData?.product ?? null;
  const content = {
    titleId,
    eyebrowPrefix,
    ctaLabel,
    specCount,
    imagePosition,
    showThumbnails,
  };
  return (
    <Section
      {...rest}
      aria-labelledby={titleId}
      containerClassName={GRID_CLASS}
    >
      {product === null ? (
        <SpotlightPlaceholder {...content} />
      ) : (
        <SpotlightProduct key={product.handle} product={product} {...content} />
      )}
    </Section>
  );
}

function SpotlightProduct({
  product,
  titleId,
  eyebrowPrefix,
  ctaLabel,
  specCount = 3,
  imagePosition,
  showThumbnails,
}: SpotlightContentProps & { product: Product }) {
  const [colorwayId, setColorwayId] = useState(product.colorways[0]?.id);
  const [requestedOptions, setRequestedOptions] = useState<
    Record<string, string>
  >({});
  const selection = resolveProductSelection(
    product,
    colorwayId,
    requestedOptions,
  );
  const { colorway, variant } = selection;
  const compareAt = saleCompareAtPrice(variant);
  const specs = product.specs.slice(0, specCount);

  return (
    <>
      <Gallery
        key={colorway.id}
        images={galleryImages(colorway)}
        imagePosition={imagePosition}
        showThumbnails={showThumbnails}
      />
      <div className={PANEL_CLASS}>
        <p className={eyebrow()}>
          {[eyebrowPrefix, CATEGORY_LABEL[product.category]]
            .filter(Boolean)
            .join(" ")}
        </p>
        <h2 id={titleId} className={TITLE_CLASS}>
          {product.title}
        </h2>
        <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-2.5 text-label">
          <strong>
            <span className="sr-only">
              {compareAt !== null ? "Sale price " : "Price "}
            </span>
            {formatMoney(variant.price)}
          </strong>
          {compareAt !== null ? (
            <del className="text-text-muted">
              <span className="sr-only">Regular price </span>
              {formatMoney(compareAt)}
            </del>
          ) : null}
        </p>
        <p className="mt-4 mb-0 text-text-muted">{product.subtitle}</p>

        <fieldset className="mt-6 mb-0 border-0 p-0">
          <legend className="sr-only">Color</legend>
          <div className={OPTION_LABEL_CLASS}>
            <span>Color</span>
            <span>{colorway.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.75">
            {product.colorways.map((entry) => {
              const soldOut = colorwayIsSoldOut(product, entry.id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={optionChip({
                    selected: entry.id === colorway.id,
                    soldOut,
                  })}
                  aria-pressed={entry.id === colorway.id}
                  aria-label={`${entry.name} colorway${soldOut ? " (sold out)" : ""}`}
                  onClick={() => setColorwayId(entry.id)}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 border border-black/25"
                    style={colorwaySwatchStyle(entry)}
                  />
                  {entry.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {product.options.map((option) => (
          <fieldset className="mt-5 mb-0 border-0 p-0" key={option.name}>
            <legend className="sr-only">{option.name}</legend>
            <div className={OPTION_LABEL_CLASS}>
              <span>{option.name}</span>
              <span>{selection.selectedOptions[option.name]}</span>
            </div>
            <div className="flex flex-wrap gap-1.75">
              {option.values.map((value) => {
                const nextOptions = {
                  ...selection.selectedOptions,
                  [option.name]: value,
                };
                const exact = findExactVariant(
                  product,
                  colorway.id,
                  nextOptions,
                );
                const available = exact?.availableForSale === true;
                const selected =
                  selection.selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={optionChip({ selected, soldOut: !available })}
                    aria-pressed={selected}
                    onClick={() => setRequestedOptions(nextOptions)}
                  >
                    {value}
                    {available ? null : (
                      <span className="sr-only"> (sold out)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {specs.length > 0 ? (
          <ul className="mt-6 mb-0 list-none border-border-subtle border-t p-0">
            {specs.map((spec) => (
              <li
                key={spec.label}
                className="flex justify-between gap-5 border-border-subtle border-b py-3 text-caption"
              >
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}

        <AddToCartForm
          key={variant.id}
          product={product}
          selection={selection}
          tone="light"
        />
        <Link
          className={cn(textLink(), "mt-4 self-start")}
          href={productSelectionHref(
            product,
            colorway.id,
            selection.selectedOptions,
          )}
        >
          {ctaLabel || "View full details"}
        </Link>
      </div>
    </>
  );
}

/** Main preview plus an optional thumbnail strip; a thumbnail swaps the preview. */
function Gallery({
  images,
  imagePosition,
  showThumbnails,
}: {
  images: readonly StorefrontImage[];
  imagePosition?: ImagePosition;
  showThumbnails: boolean;
}) {
  const [active, setActive] = useState(0);
  const preview = images[active] ?? images[0];
  return (
    <div
      className={mediaColumn({
        imagePosition,
        thumbnails: showThumbnails && images.length > 1,
      })}
    >
      {preview ? (
        <Image
          key={preview.src}
          className={cn(
            PREVIEW_CLASS,
            "transition-opacity duration-300 ease-standard starting:opacity-0",
          )}
          src={preview.src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      ) : null}
      {showThumbnails && images.length > 1 ? (
        <div className="grid grid-cols-4 content-start gap-2 md:order-first md:grid-cols-1">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "cursor-pointer border-2 p-0 transition-[border-color,opacity] duration-fast",
                index === active
                  ? "border-ink"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                className={IMAGE_CLASS}
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                sizes="140px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SpotlightPlaceholder({
  titleId,
  eyebrowPrefix,
  imagePosition,
  showThumbnails,
}: SpotlightContentProps) {
  return (
    <>
      <div
        className={mediaColumn({ imagePosition, thumbnails: showThumbnails })}
        aria-hidden="true"
      >
        <Image
          className={PREVIEW_CLASS}
          src={IMAGES_PLACEHOLDERS.product_2}
          alt=""
          width={1024}
          height={1280}
          unoptimized
        />
        {showThumbnails ? (
          <div className="grid grid-cols-4 content-start gap-2 md:order-first md:grid-cols-1">
            {PLACEHOLDER_THUMBS.map((src) => (
              <Image
                key={src}
                className={IMAGE_CLASS}
                src={src}
                alt=""
                width={256}
                height={320}
                unoptimized
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className={PANEL_CLASS}>
        <p className={eyebrow()}>
          {[eyebrowPrefix, "Category"].filter(Boolean).join(" ")}
        </p>
        <h2 id={titleId} className={TITLE_CLASS}>
          Product title
        </h2>
        <p className="mt-3 mb-0 text-label">$00.00</p>
        <p className="mt-4 mb-0 text-text-muted">
          Select a product to show its colorways, sizes, and add to cart here.
        </p>
        <div className="mt-6 flex gap-1.75" aria-hidden="true">
          {PLACEHOLDER_CHIPS.map((chip) => (
            <span
              key={chip}
              className="h-11 w-24 border border-border-subtle"
            />
          ))}
        </div>
        <span className={cn(cta(), "mt-7.5 self-start")} aria-hidden="true">
          Add to cart
        </span>
      </div>
    </>
  );
}

export default ProductSpotlight;

export { schema } from "./schema";
