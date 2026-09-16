"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, StorefrontImage } from "@/lib/storefront/types";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface ProductTilesProps extends WeaverseElementProps {
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: {
    tiles: readonly { product: Product; image: StorefrontImage }[];
  };
}

/** Full-bleed product tiles, each linking through to its product page. */
function ProductTiles({ loaderData, ...rest }: ProductTilesProps) {
  const tiles = loaderData?.tiles ?? [];
  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-1 bg-ink md:grid-cols-3"
    >
      {tiles.map(({ product, image }) => (
        <Link
          className="relative min-h-150 text-text-inverse md:min-h-162.5"
          href={`/products/${product.handle}`}
          key={product.handle}
        >
          <Image
            className="h-full object-cover saturate-65"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 820px) 34vw, 100vw"
          />
          <div className="absolute right-5 bottom-5 left-5 grid gap-1.75 bg-ink/92 p-5">
            <span>{product.category}</span>
            <strong>{product.title}</strong>
            <span>Inspect product →</span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default ProductTiles;

export { schema } from "./schema";
