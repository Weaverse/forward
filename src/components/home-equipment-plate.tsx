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

interface HomeEquipmentPlateProps {
  product: Product;
  tag: string;
  /** Aspect utility for the lead frame, e.g. `aspect-3/4`. */
  aspect: string;
  /** Stacks the colorway's in-the-field frame under the lead frame. */
  withContext?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Home-only editorial product plate. Unlike the shared catalog card, plates
 * carry their own scale and may stack a second in-the-field frame, so the
 * index reads as an asymmetric field rather than a uniform row. Selecting a
 * colorway swaps the primary/context images and retargets both product links,
 * matching the shared ProductCard's selection semantics.
 */
export function HomeEquipmentPlate({
  product,
  tag,
  aspect,
  withContext,
  priority,
  className,
}: HomeEquipmentPlateProps) {
  const [activeColorwayId, setActiveColorwayId] = useState(
    product.colorways[0]?.id ?? "",
  );
  const swatchGroupName = useId();
  const activeColorway = resolveColorway(product, activeColorwayId);
  const href = productColorwayHref(product, activeColorway.id);

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={href} className="relative block bg-parchment">
        <Image
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1024px) 34vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className={cn("w-full object-cover", aspect)}
        />
        <span
          aria-hidden="true"
          className="field-label absolute right-0 top-3 bg-acid px-2 py-1 text-carbon"
        >
          {tag}
        </span>
        {withContext ? (
          <Image
            src={activeColorway.images.context.src}
            alt={activeColorway.images.context.alt}
            width={activeColorway.images.context.width}
            height={activeColorway.images.context.height}
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 90vw"
            className="aspect-square w-full object-cover"
          />
        ) : null}
        <span
          aria-hidden="true"
          className="plate-mark pointer-events-none absolute bottom-1 left-4 text-cream/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]"
        >
          {product.plate}
        </span>
      </Link>
      <div className="flex items-baseline justify-between gap-4 pt-4">
        <h3 className="font-display text-xl leading-tight text-carbon lg:text-2xl">
          <Link href={href} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <p className="field-label text-carbon">{formatMoney(product.price)}</p>
      </div>
      <p className="field-label mt-2 text-slate">
        {product.category} / {product.activities.join(" · ")}
      </p>
      <fieldset className="mt-1 flex min-w-0 items-center text-slate">
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
                  className="block size-2.5 rounded-full border border-carbon/25"
                  style={{ backgroundColor: entry.swatchColor }}
                />
              </span>
            </label>
          );
        })}
        <span className="field-label ml-auto text-right text-slate">
          {activeColorway.name} ·{" "}
          {String(product.colorways.length).padStart(2, "0")} colorways
        </span>
      </fieldset>
    </article>
  );
}
