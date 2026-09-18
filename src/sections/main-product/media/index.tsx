"use client";

import { cva } from "class-variance-authority";
import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { galleryImages } from "@/lib/storefront/product-state";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";
import { GalleryModal } from "./gallery-modal";

type Layout = "editorial" | "grid" | "stack";

const gallery = cva(
  "col-start-1 row-start-1 grid min-w-0 grid-cols-1 content-start gap-2.5 bg-ink p-2.5",
  {
    variants: {
      layout: {
        editorial: "md:grid-cols-[1.25fr_0.75fr]",
        grid: "md:grid-cols-2",
        stack: "",
      },
      position: { left: "md:col-start-1", right: "md:col-start-2" },
    },
    defaultVariants: { layout: "editorial", position: "right" },
  },
);

/**
 * Editorial: the lead image spans two rows beside a pair, and anything from
 * the fourth image on runs full width at its natural ratio.
 */
function tile(layout: Layout, index: number) {
  const wide = layout === "editorial" && index >= 3;
  const lead = layout === "editorial" && index === 0;
  return {
    frame: cn(
      "relative overflow-hidden bg-media-placeholder p-0",
      lead && "md:col-start-1 md:row-span-2",
      wide && "col-span-full",
    ),
    image: cn(
      "w-full saturate-72",
      wide
        ? "h-auto min-h-0 aspect-auto object-contain"
        : "aspect-4/5 h-auto object-cover md:h-full",
      lead && "md:aspect-auto md:min-h-235",
    ),
    sizes:
      layout === "grid"
        ? "(min-width: 820px) 28vw, 100vw"
        : layout === "stack" || lead || wide
          ? "(min-width: 820px) 55vw, 100vw"
          : "40vw",
  };
}

interface ProductMediaProps extends WeaverseElementProps {
  layout?: Layout;
  enableZoom?: boolean;
  showZoomHint?: boolean;
  zoomHintText?: string;
}

/** The selected colorway's images, optionally opening a full-screen zoom. */
function ProductMedia({
  layout,
  enableZoom,
  showZoomHint,
  zoomHintText,
  ...rest
}: ProductMediaProps) {
  const state = useMainProduct();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  if (state === null) return null;
  const { product, selection, galleryPosition } = state;
  const { colorway } = selection;
  const images = galleryImages(colorway);
  const resolvedLayout = layout ?? "editorial";
  const zoom = enableZoom !== false;
  const hint = showZoomHint === false ? "" : (zoomHintText ?? "Zoom +");

  function closeModal() {
    setModalIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <section
        {...elementAttributes(rest)}
        className={gallery({
          layout: resolvedLayout,
          position: galleryPosition,
        })}
        aria-label={`${product.title} gallery`}
      >
        {images.map((image, index) => {
          const {
            frame,
            image: imageClass,
            sizes,
          } = tile(resolvedLayout, index);
          const picture = (
            <Image
              className={imageClass}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={sizes}
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
          );
          if (!zoom) {
            return (
              <div className={frame} key={image.src}>
                {picture}
              </div>
            );
          }
          return (
            <button
              key={image.src}
              type="button"
              className={frame}
              aria-label={`Zoom image ${index + 1}: ${image.alt}`}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setModalIndex(index);
              }}
            >
              {picture}
              {hint === "" ? null : (
                <span
                  className="absolute right-3 bottom-3 bg-black/88 px-2.5 py-1.75 font-body text-micro text-text-inverse uppercase"
                  aria-hidden="true"
                >
                  {hint}
                </span>
              )}
            </button>
          );
        })}
      </section>
      {zoom && modalIndex !== null ? (
        <GalleryModal
          key={colorway.id}
          product={product}
          colorway={colorway}
          initialIndex={modalIndex}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}

export default ProductMedia;

export { schema } from "./schema";
