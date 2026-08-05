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
  /** Plate index shown in the field-report frame, e.g. "01". */
  plate?: string;
  priority?: boolean;
}

/**
 * PLP/search product card. Selecting a swatch swaps the card's primary image
 * and retargets the deep link to that exact colorway state.
 */
export function ProductCard({ product, plate, priority }: ProductCardProps) {
  const [activeColorwayId, setActiveColorwayId] = useState(
    product.colorways[0]?.id ?? "",
  );
  const swatchGroupName = useId();
  const activeColorway = resolveColorway(product, activeColorwayId);
  const href = productColorwayHref(product, activeColorway.id);

  return (
    <article className="group flex flex-col border border-mist bg-parchment">
      <Link href={href} className="relative block">
        <Image
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className="aspect-4/5 w-full object-cover"
        />
        {plate !== undefined ? (
          <span
            aria-hidden="true"
            className="field-label absolute left-3 top-3 border border-ink/20 bg-bone/90 px-2 py-1 text-ink"
          >
            Plate {plate}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-mist px-4 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg text-pine">
            <Link href={href} className="hover:text-clay">
              {product.title}
            </Link>
          </h3>
          <p className="field-label text-ink">{formatMoney(product.price)}</p>
        </div>
        <p className="text-sm leading-snug text-slate">{product.subtitle}</p>
        <fieldset className="mt-auto flex min-w-0 items-center gap-2 pt-2">
          <legend className="sr-only">{product.title} colorway</legend>
          {product.colorways.map((entry) => {
            const selected = entry.id === activeColorway.id;
            return (
              <label
                key={entry.id}
                className={cn(
                  "flex size-11 cursor-pointer items-center justify-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-clay",
                  selected ? "border border-ink" : "border border-transparent",
                )}
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
                  className="block size-6 border border-ink/25"
                  style={{ backgroundColor: entry.swatchColor }}
                />
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
