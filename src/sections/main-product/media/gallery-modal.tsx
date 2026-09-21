"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { galleryImages } from "@/lib/storefront/product-state";
import type { Product, ProductColorway } from "@/lib/storefront/types";

/** Full-screen gallery: arrow keys step, Escape closes. */
export function GalleryModal({
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
      className="m-0 flex h-dvh max-h-none w-screen max-w-none flex-col overflow-hidden border-0 bg-ink p-0 text-text-inverse backdrop:bg-black/94"
      aria-label={`${product.title} image gallery`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
    >
      <div className="grid h-14.5 shrink-0 grid-cols-lead-trailing items-center gap-7.5 border-border-dark border-b px-5 font-field-meta text-micro uppercase md:grid-cols-[1fr_auto_auto]">
        <span>
          {product.title} / {colorway.name}
        </span>
        <span className="hidden md:inline">
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-12.5 py-3 md:px-20 md:py-4.5">
        <Image
          className="h-full w-full bg-transparent object-contain"
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          priority
        />
        <button
          className="absolute top-1/2 left-4 h-14 w-12 -translate-y-1/2 bg-signal text-product-price text-ink"
          type="button"
          onClick={() =>
            setIndex((current) => (current - 1 + images.length) % images.length)
          }
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          className="absolute top-1/2 right-4 h-14 w-12 -translate-y-1/2 bg-signal text-product-price text-ink"
          type="button"
          onClick={() => setIndex((current) => (current + 1) % images.length)}
          aria-label="Next image"
        >
          →
        </button>
      </div>
      <fieldset className="flex h-20 shrink-0 justify-center gap-2 border-border-dark border-t p-2.25 md:h-22.5">
        <legend className="sr-only">Choose gallery image</legend>
        {images.map((entry, entryIndex) => (
          <button
            key={entry.src}
            type="button"
            className={cn(
              "w-14 border p-0",
              entryIndex === index
                ? "border-signal opacity-100"
                : "border-transparent opacity-55",
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
