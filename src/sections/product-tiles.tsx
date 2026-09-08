import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import type { Product, StorefrontImage } from "@/lib/storefront/types";

interface ProductTilesProps {
  tiles: readonly { product: Product; image: StorefrontImage }[];
}

/** Full-bleed product tiles, each linking through to its product page. */
export function ProductTiles({ tiles }: ProductTilesProps) {
  return (
    <section className="grid grid-cols-3 bg-ink max-md:grid-cols-1">
      {tiles.map(({ product, image }) => (
        <Link
          className="relative min-h-162.5 text-text-inverse max-md:min-h-150"
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

export const schema = createSchema({
  type: "product-tiles",
  title: "Product tiles",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "tileProductHandles",
          label: "Product handles, one per line",
        },
      ],
    },
  ],
});
