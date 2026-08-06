"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/storefront/format";
import {
  productColorwayHref,
  resolveColorway,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

interface ProductCardProps {
  product: Product;
  /** Plate index shown as the oversized card number, e.g. "01". */
  plate?: string;
  /** Pushes the card down on large screens for the staggered editorial grid. */
  stagger?: boolean;
  priority?: boolean;
}

/**
 * Numbered editorial product card shared by home/PLP/collection/search.
 * Selecting a swatch swaps the card's primary image and retargets the deep
 * link to that exact colorway state.
 */
export function ProductCard({
  product,
  plate,
  stagger,
  priority,
}: ProductCardProps) {
  const [activeColorwayId, setActiveColorwayId] = useState(
    product.colorways[0]?.id ?? "",
  );
  const swatchGroupName = useId();
  const activeColorway = resolveColorway(product, activeColorwayId);
  const href = productColorwayHref(product, activeColorway.id);
  const tag = product.activities[0];

  return (
    <article className={cn("group flex flex-col", stagger && "lg:mt-16")}>
      <Link href={href} className="relative block bg-parchment">
        <Image
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className="aspect-4/5 w-full object-cover"
        />
        {tag !== undefined ? (
          <span
            aria-hidden="true"
            className="field-label absolute right-0 top-3 bg-acid px-2 py-1 text-carbon"
          >
            {tag}
          </span>
        ) : null}
        {plate !== undefined ? (
          <span
            aria-hidden="true"
            className="plate-number pointer-events-none absolute bottom-1 left-3 text-cream/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]"
          >
            {plate}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl leading-tight text-carbon">
            <Link href={href} className="hover:underline">
              {product.title}
            </Link>
          </h3>
          <p className="field-label text-carbon">
            {formatMoney(product.price)}
          </p>
        </div>
        <p className="field-label text-slate">
          {product.category} / {product.activities.join(" · ")}
        </p>
        <fieldset className="mt-auto flex min-w-0 items-center pt-1">
          <legend className="sr-only">{product.title} colorway</legend>
          {product.colorways.map((entry) => {
            const selected = entry.id === activeColorway.id;
            return (
              <label
                key={entry.id}
                className="flex size-11 cursor-pointer items-center justify-center has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-carbon"
              >
                <input
                  type="radio"
                  name={swatchGroupName}
                  value={entry.id}
                  checked={selected}
                  onChange={() => setActiveColorwayId(entry.id)}
                  className="sr-only"
                />
                <span className="sr-only">{entry.name} colorway</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-carbon" : "border-transparent",
                  )}
                >
                  <span
                    className="block size-3 rounded-full border border-carbon/25"
                    style={{ backgroundColor: entry.swatchColor }}
                  />
                </span>
              </label>
            );
          })}
          <span className="field-label ml-auto text-slate">
            {activeColorway.name}
          </span>
        </fieldset>
      </div>
    </article>
  );
}
