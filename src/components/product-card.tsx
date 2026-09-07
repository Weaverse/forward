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
 * Product card shared by Home, catalog, search, and related-product grids.
 * Parent surfaces own grid geometry while the card keeps one consistent 4:5
 * image treatment and real colorway controls.
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
    <article className="relative min-w-0 bg-transparent">
      <Link
        className="group relative block overflow-hidden bg-media-card"
        href={href}
        aria-label={`View ${product.title}`}
      >
        <Image
          className="aspect-4/5 object-cover saturate-76 transition-transform duration-450 ease-media group-hover:scale-102.5"
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1100px) 34vw, (min-width: 560px) 45vw, 90vw"
          priority={priority}
        />
        {badge !== undefined ? (
          <span className="absolute top-0 right-0 bg-signal px-2.25 py-1.75 font-body text-nano font-medium text-ink tracking-control uppercase">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="border-ink border-t px-0 pt-3.5 pb-5.5">
        <div className="flex justify-between gap-4.5 max-sm:block">
          <h3 className="m-0 font-heading text-card-title font-semibold max-sm:text-copy">
            <Link href={href}>{product.title}</Link>
          </h3>
          <span className="whitespace-nowrap text-label max-sm:mt-0.75 max-sm:block">
            {formatMoney(product.price)}
          </span>
        </div>
        <p className="mt-1.25 font-body text-micro font-semibold text-text-muted uppercase max-sm:hidden">
          {product.category} / {product.activities.join(" · ")}
        </p>
        <fieldset className="mt-1 flex min-h-touch items-center gap-1.25">
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
                className="inline-flex size-5.5 items-center justify-center border border-transparent transition-colors duration-fast ease-standard peer-checked:border-ink peer-focus-visible:outline-3 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2"
              >
                <span
                  className="size-3 border border-black/25"
                  style={{ backgroundColor: entry.swatchColor }}
                />
              </span>
            </label>
          ))}
          <span className="ml-auto pl-2.5 font-body text-nano text-text-muted tracking-label uppercase">
            {activeColorway.name} ·{" "}
            {String(product.colorways.length).padStart(2, "0")} colorways
          </span>
        </fieldset>
      </div>
    </article>
  );
}
