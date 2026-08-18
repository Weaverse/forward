"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { AddToCartForm } from "@/components/add-to-cart-form";
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

interface ProductDetailProps {
  product: Product;
  fieldRecord: ReactNode;
}

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
      className="gallery-modal"
      aria-label={`${product.title} image gallery`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
    >
      <div className="gallery-modal-bar">
        <span>
          {product.title} / {colorway.name}
        </span>
        <span>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image gallery"
        >
          Close ×
        </button>
      </div>
      <div className="gallery-modal-stage">
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          priority
        />
        <button
          className="gallery-modal-arrow gallery-modal-prev"
          type="button"
          onClick={() =>
            setIndex((current) => (current - 1 + images.length) % images.length)
          }
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          className="gallery-modal-arrow gallery-modal-next"
          type="button"
          onClick={() => setIndex((current) => (current + 1) % images.length)}
          aria-label="Next image"
        >
          →
        </button>
      </div>
      <fieldset className="gallery-modal-thumbs">
        <legend className="sr-only">Choose gallery image</legend>
        {images.map((entry, entryIndex) => (
          <button
            key={entry.src}
            type="button"
            className={cn(entryIndex === index && "active")}
            aria-label={`View image ${entryIndex + 1}: ${entry.alt}`}
            aria-pressed={entryIndex === index}
            onClick={() => setIndex(entryIndex)}
          >
            <Image
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
      <section className="gallery" aria-label={`${product.title} gallery`}>
        {gallery.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className="gallery-button"
            aria-label={`Zoom image ${index + 1}: ${image.alt}`}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setModalIndex(index);
            }}
          >
            <Image
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
            <span className="gallery-zoom-label" aria-hidden="true">
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
    <div className="pdp">
      <ProductGallery key={colorway.id} product={product} colorway={colorway} />
      <section className="product-panel" aria-label="Purchase panel">
        <div className="product-panel-inner">
          <p className="breadcrumbs">
            <Link href="/shop">Shop</Link> /{" "}
            <Link href={`/shop?category=${product.category}`}>
              {product.category}
            </Link>
          </p>
          <div className="product-kicker">
            <span className="eyebrow">Forward equipment</span>
            <span className="meta">{specBadge}</span>
          </div>
          <h1 className="product-title">{product.title}</h1>
          <p className="product-price">
            <strong>
              <span className="sr-only">
                {compareAt !== null ? "Sale price " : "Price "}
              </span>
              {formatMoney(selection.variant.price)}
            </strong>
            {compareAt !== null ? (
              <>
                <del className="product-compare-at">
                  <span className="sr-only">Regular price </span>
                  {formatMoney(compareAt)}
                </del>
                <span className="product-sale-flag">On sale</span>
              </>
            ) : null}
          </p>
          <p className="product-intro">{product.description}</p>

          <div className="option-group">
            <div className="option-label">
              <span>Color</span>
              <span>{colorway.name}</span>
            </div>
            <div className="option-row">
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
                    className={cn(
                      "option-chip",
                      soldOut && "sold-out",
                      selected && "selected",
                    )}
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
                      className="swatch"
                      style={{ backgroundColor: entry.swatchColor }}
                    />
                    {entry.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {product.options.map((option) => (
            <div className="option-group" key={option.name}>
              <div className="option-label">
                <span>{option.name}</span>
                <span>{selection.selectedOptions[option.name]}</span>
              </div>
              <div className="option-row">
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
                        className={cn(
                          "option-chip sold-out unavailable",
                          selected && "selected",
                        )}
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
                      className={cn("option-chip", selected && "selected")}
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
            </div>
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
