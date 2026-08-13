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
 * by the Home runway, PLP, collection, search, and related-product grids. Grid
 * span, image ratio, and stagger come entirely from the `.product-runway` /
 * `.plp-grid` nth-child rules in `canonical-source.css`.
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
    <article className="product-card">
      <Link
        className="product-image-link"
        href={href}
        aria-label={`View ${product.title}`}
      >
        <Image
          src={activeColorway.images.primary.src}
          alt={activeColorway.images.primary.alt}
          width={activeColorway.images.primary.width}
          height={activeColorway.images.primary.height}
          sizes="(min-width: 1100px) 34vw, (min-width: 560px) 45vw, 90vw"
          priority={priority}
        />
        {badge !== undefined ? (
          <span className="product-badge">{badge}</span>
        ) : null}
      </Link>
      <div className="product-info">
        <div className="product-info-row">
          <h3 className="product-name">
            <Link href={href}>{product.title}</Link>
          </h3>
          <span className="product-price">{formatMoney(product.price)}</span>
        </div>
        <p className="product-detail">
          {product.category} / {product.activities.join(" · ")}
        </p>
        <fieldset className="swatches">
          <legend className="sr-only">{product.title} colorway</legend>
          {product.colorways.map((entry) => (
            <label key={entry.id} className="swatch-control">
              <input
                type="radio"
                name={swatchGroupName}
                value={entry.id}
                checked={entry.id === activeColorway.id}
                onChange={() => setActiveColorwayId(entry.id)}
              />
              <span className="sr-only">{entry.name} colorway</span>
              <span aria-hidden="true" className="swatch-ring">
                <span
                  className="swatch"
                  style={{ backgroundColor: entry.swatchColor }}
                />
              </span>
            </label>
          ))}
          <span className="swatch-name">
            {activeColorway.name} ·{" "}
            {String(product.colorways.length).padStart(2, "0")} colorways
          </span>
        </fieldset>
      </div>
    </article>
  );
}
