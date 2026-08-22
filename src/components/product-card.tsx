"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { formatMoney } from "@/lib/storefront/format";
import {
  productColorwayHref,
  resolveColorway,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * Canonical product card. Source `app.js:87–107` — one card hierarchy shared
 * by Home, PLP, collection, search, and related-product grids. Parent surfaces
 * own grid geometry while the card keeps one consistent 4:5 image treatment.
 *
 * The canonical `.swatches` row is inert decoration. Forward's swatches are
 * real controls: native radios in 44×44 targets, a visible selected ring and
 * name, and a deep link that retargets to the selected colorway.
 */
export function ProductCard({ product, priority }: ProductCardProps) {
  const [activeColorwayId, setActiveColorwayId] = useState(
    product.colorways[0]?.id ?? "",
  );
  const swatchGroupName = useId();
  const activeColorway = resolveColorway(product, activeColorwayId);
  const href = productColorwayHref(product, activeColorway.id);
  const badge = product.activities[0];

  return (
    <article className="product-card relative min-w-0 bg-transparent">
      <Link
        className="group relative block overflow-hidden bg-[#d4cdbf]"
        href={href}
        aria-label={`View ${product.title}`}
      >
        <Image
          className="aspect-4/5 object-cover saturate-[0.76] transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.025]"
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1100px) 34vw, (min-width: 560px) 45vw, 90vw"
          priority={priority}
        />
        {badge !== undefined ? (
          <span className="absolute top-0 right-0 bg-signal px-[9px] py-[7px] font-body text-[8px] font-medium text-ink tracking-[0.08em] uppercase">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="border-ink border-t px-0 pt-[14px] pb-[22px]">
        <div className="flex justify-between gap-[18px] max-sm:block">
          <h3 className="m-0 font-heading text-[19px] font-semibold max-sm:text-[15px]">
            <Link href={href}>{product.title}</Link>
          </h3>
          <span className="whitespace-nowrap text-[13px] max-sm:mt-[3px] max-sm:block">
            {formatMoney(product.price)}
          </span>
        </div>
        <p className="mt-[5px] font-body text-[9px] font-semibold text-text-muted uppercase max-sm:hidden">
          {product.category} / {product.activities.join(" · ")}
        </p>
        <fieldset className="mt-1 flex min-h-touch items-center gap-[5px]">
          <legend className="sr-only">{product.title} colorway</legend>
          {product.colorways.map((entry) => (
            <label
              key={entry.id}
              className="inline-flex size-touch flex-none items-center justify-center first-of-type:-ml-3"
            >
              <input
                className="peer sr-only"
                type="radio"
                name={swatchGroupName}
                value={entry.id}
                checked={entry.id === activeColorway.id}
                onChange={() => setActiveColorwayId(entry.id)}
              />
              <span className="sr-only">{entry.name} colorway</span>
              <span
                aria-hidden="true"
                className="inline-flex size-[22px] items-center justify-center border border-transparent transition-colors duration-fast ease-standard peer-checked:border-ink peer-focus-visible:outline-[3px] peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2"
              >
                <span
                  className="size-3 border border-black/25"
                  style={{ backgroundColor: entry.swatchColor }}
                />
              </span>
            </label>
          ))}
          <span className="ml-auto pl-2.5 font-body text-[8px] text-text-muted tracking-[0.1em] uppercase">
            {activeColorway.name} ·{" "}
            {String(product.colorways.length).padStart(2, "0")} colorways
          </span>
        </fieldset>
      </div>
    </article>
  );
}
