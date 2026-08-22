"use client";

import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/storefront/format";
import {
  COLORWAY_PARAM,
  colorwayIsSoldOut,
  findExactVariant,
  galleryImages,
  optionParamKey,
  productSelectionHref,
  resolveProductSelection,
  saleCompareAtPrice,
  type ProductSelection,
} from "@/lib/storefront/product-state";
import type { Product, ProductColorway } from "@/lib/storefront/types";
import { AddToCartForm } from "./add-to-cart-form";

interface ProductDetailProps {
  product: Product;
  fieldRecord: ReactNode;
}

const optionChip = cva(
  "relative inline-flex min-h-touch min-w-12 items-center justify-center gap-2 border px-3.5 py-2 font-body text-[12px] font-bold",
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
        true: "line-through after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_top_right,transparent_calc(50%_-_1px),currentColor_calc(50%_-_1px),currentColor_calc(50%_+_1px),transparent_calc(50%_+_1px))] after:content-['']",
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

function requestedOptions(
  product: Product,
  params: URLSearchParams,
): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(
    product.options.map((option) => [
      option.name,
      params.get(optionParamKey(option.name)) ?? undefined,
    ]),
  );
}

export function ProductDetail({ product, fieldRecord }: ProductDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selection = resolveProductSelection(
    product,
    searchParams.get(COLORWAY_PARAM) ?? undefined,
    requestedOptions(product, searchParams),
  );
  const canonicalHref = productSelectionHref(
    product,
    selection.colorway.id,
    selection.selectedOptions,
    searchParams,
  );

  useEffect(() => {
    const query = searchParams.toString();
    const current = `${pathname}${query === "" ? "" : `?${query}`}`;
    if (current !== canonicalHref)
      router.replace(canonicalHref, { scroll: false });
  }, [canonicalHref, pathname, router, searchParams]);

  return (
    <ProductDetailView
      product={product}
      selection={selection}
      currentParams={searchParams}
      fieldRecord={fieldRecord}
    />
  );
}

export function ProductDetailFallback({
  product,
  fieldRecord,
}: ProductDetailProps) {
  return (
    <ProductDetailView
      product={product}
      selection={resolveProductSelection(product, undefined)}
      currentParams={new URLSearchParams()}
      fieldRecord={fieldRecord}
    />
  );
}

function GalleryModal({
  product,
  colorway,
  initialIndex,
  onClose,
}: {
  product: Product;
  colorway: ProductColorway;
  initialIndex: number;
  onClose(): void;
}) {
  const images = galleryImages(colorway);
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  const image = images[index];
  if (image === undefined) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-svh max-h-none w-screen max-w-none border-0 bg-ink p-0 text-text-inverse backdrop:bg-black/[0.94]"
      aria-label={`${product.title} image gallery`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
    >
      <div className="grid h-[58px] grid-cols-[1fr_auto_auto] items-center gap-[30px] border-border-dark border-b px-5 font-field-meta text-[9px] uppercase max-md:grid-cols-[1fr_auto]">
        <span>
          {product.title} / {colorway.name}
        </span>
        <span className="max-md:hidden">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
        <button
          className="min-h-touch bg-signal px-4 text-ink"
          type="button"
          onClick={onClose}
          aria-label="Close image gallery"
        >
          Close ×
        </button>
      </div>
      <div className="relative grid h-[calc(100svh-148px)] place-items-center px-20 py-[18px] max-md:h-[calc(100svh-138px)] max-md:px-[50px] max-md:py-3">
        <Image
          className="h-full w-auto max-w-full object-contain"
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          priority
        />
        <button
          className="absolute top-1/2 left-4 h-14 w-12 bg-signal text-[24px] text-ink"
          type="button"
          onClick={() =>
            setIndex((current) => (current - 1 + images.length) % images.length)
          }
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          className="absolute top-1/2 right-4 h-14 w-12 bg-signal text-[24px] text-ink"
          type="button"
          onClick={() => setIndex((current) => (current + 1) % images.length)}
          aria-label="Next image"
        >
          →
        </button>
      </div>
      <fieldset className="flex h-[90px] justify-center gap-2 border-border-dark border-t p-[9px] max-md:h-20">
        <legend className="sr-only">Choose gallery image</legend>
        {images.map((entry, entryIndex) => (
          <button
            key={entry.src}
            type="button"
            className={cn(
              "w-14 border p-0",
              entryIndex === index
                ? "border-signal opacity-100"
                : "border-transparent opacity-[0.55]",
            )}
            aria-label={`View image ${entryIndex + 1}: ${entry.alt}`}
            aria-pressed={entryIndex === index}
            onClick={() => setIndex(entryIndex)}
          >
            <Image
              className="h-full w-full object-cover"
              src={entry.src}
              alt=""
              width={entry.width}
              height={entry.height}
              sizes="96px"
            />
          </button>
        ))}
      </fieldset>
    </dialog>
  );
}

function ProductGallery({
  product,
  colorway,
}: {
  product: Product;
  colorway: ProductColorway;
}) {
  const gallery = galleryImages(colorway);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function closeModal() {
    setModalIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <section
        className="col-start-1 row-start-1 grid min-w-0 grid-cols-1 content-start gap-2.5 bg-ink p-2.5 md:col-start-2 md:grid-cols-[1.25fr_0.75fr]"
        aria-label={`${product.title} gallery`}
      >
        {gallery.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className={cn(
              "relative overflow-hidden bg-media-placeholder p-0",
              index === 0 && "md:col-start-1 md:row-span-2",
              index >= 3 && "col-span-full",
            )}
            aria-label={`Zoom image ${index + 1}: ${image.alt}`}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setModalIndex(index);
            }}
          >
            <Image
              className={cn(
                "w-full saturate-[0.72]",
                index >= 3
                  ? "h-auto min-h-0 aspect-auto object-contain"
                  : "aspect-4/5 h-auto object-cover md:h-full",
                index === 0 && "md:aspect-auto md:min-h-[940px]",
              )}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={
                index === 0 || index >= 3
                  ? "(min-width: 820px) 55vw, 100vw"
                  : "40vw"
              }
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
            <span
              className="absolute right-3 bottom-3 bg-black/[0.88] px-2.5 py-[7px] font-body text-[9px] text-text-inverse uppercase"
              aria-hidden="true"
            >
              Zoom +
            </span>
          </button>
        ))}
      </section>
      {modalIndex !== null ? (
        <GalleryModal
          product={product}
          colorway={colorway}
          initialIndex={modalIndex}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}

interface ProductDetailViewProps extends ProductDetailProps {
  selection: ProductSelection;
  currentParams: URLSearchParams;
}

function ProductDetailView({
  product,
  selection,
  currentParams,
  fieldRecord,
}: ProductDetailViewProps) {
  const { colorway } = selection;
  const specBadge = product.specs[0]?.value ?? product.category;
  const compareAt = saleCompareAtPrice(selection.variant);

  return (
    <div className="grid min-h-[80vh] grid-cols-1 bg-ink md:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)] lg:grid-cols-[minmax(420px,0.72fr)_minmax(0,1.28fr)]">
      <ProductGallery key={colorway.id} product={product} colorway={colorway} />
      <section
        className="relative col-start-1 row-start-2 border-border-dark border-t text-text-inverse md:row-start-1 md:border-t-0 md:border-r"
        aria-label="Purchase panel"
      >
        <div className="bg-ink px-page-gutter pt-11 pb-[70px] md:sticky md:top-[calc(var(--spacing-header)+30px)] md:p-[34px] lg:p-[clamp(36px,5vw,80px)]">
          <p className="mb-7 font-field-meta text-[11px] font-medium text-text-dark-muted tracking-field-meta uppercase">
            <Link href="/shop">Shop</Link> /{" "}
            <Link href={`/shop?category=${product.category}`}>
              {product.category}
            </Link>
          </p>
          <div className="mb-[22px] flex justify-between gap-5">
            <span className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal tracking-field-meta uppercase">
              Forward equipment
            </span>
            <span className="font-field-meta text-[12px] font-medium text-text-dark-muted tracking-field-meta uppercase">
              {specBadge}
            </span>
          </div>
          <h1 className="mt-0 mb-3 text-balance font-heading text-[clamp(44px,3.7vw,66px)] leading-[0.96] font-medium tracking-heading [overflow-wrap:anywhere]">
            {product.title}
          </h1>
          <p className="m-0 flex flex-wrap items-baseline gap-2.5 text-[13px] whitespace-nowrap">
            <strong>
              <span className="sr-only">
                {compareAt !== null ? "Sale price " : "Price "}
              </span>
              {formatMoney(selection.variant.price)}
            </strong>
            {compareAt !== null ? (
              <>
                <del className="text-text-dark-muted line-through">
                  <span className="sr-only">Regular price </span>
                  {formatMoney(compareAt)}
                </del>
                <span className="bg-signal px-2 py-1 font-body text-[11px] font-extrabold text-ink tracking-[0.08em] uppercase">
                  On sale
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-[25px] mb-[30px] text-[16px] text-text-dark-muted">
            {product.description}
          </p>

          <fieldset className="my-6">
            <legend className="sr-only">Color</legend>
            <div className="mb-2.5 flex justify-between font-body text-[9px] font-medium tracking-[0.08em] uppercase">
              <span>Color</span>
              <span>{colorway.name}</span>
            </div>
            <div className="flex flex-wrap gap-[7px]">
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
                    <span
                      aria-hidden="true"
                      className="size-3 border border-white/40"
                      style={{ backgroundColor: entry.swatchColor }}
                    />
                    {entry.name}
                  </Link>
                );
              })}
            </div>
          </fieldset>

          {product.options.map((option) => (
            <fieldset className="my-6" key={option.name}>
              <legend className="sr-only">{option.name}</legend>
              <div className="mb-2.5 flex justify-between font-body text-[9px] font-medium tracking-[0.08em] uppercase">
                <span>{option.name}</span>
                <span>{selection.selectedOptions[option.name]}</span>
              </div>
              <div className="flex flex-wrap gap-[7px]">
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
                  const selected =
                    selection.selectedOptions[option.name] === value;
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

          <AddToCartForm
            key={selection.variant.id}
            product={product}
            selection={selection}
          />
          {fieldRecord}
        </div>
      </section>
    </div>
  );
}
