import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
  textLink,
  VIEWPORT_SECTION_CLASS,
} from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";

interface KitCalloutProps {
  eyebrowLabel: string;
  heading: string;
  linkLabel: string;
  product: Product;
  tiles: readonly { product: Product; image: StorefrontImage }[];
}

/** A named kit: one anchor product beside the pieces that travel with it. */
export function KitCallout({
  eyebrowLabel,
  heading,
  linkLabel,
  product,
  tiles,
}: KitCalloutProps) {
  return (
    <section
      className={cn(
        SHELL_SECTION_CLASS,
        "grid grid-cols-[0.55fr_1.45fr] items-end gap-15 max-md:grid-cols-1",
        VIEWPORT_SECTION_CLASS,
      )}
    >
      <div className="pb-7.5">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
        <p className="mb-prose-paragraph">{product.subtitle}</p>
        <Link className={textLink()} href={`/products/${product.handle}`}>
          {linkLabel}
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 max-md:gap-1.75">
        {tiles.map((tile) => (
          <Link
            href={`/products/${tile.product.handle}`}
            key={tile.product.handle}
          >
            <Image
              className="aspect-4/5 object-cover md-up:max-h-[calc(var(--home-viewport-media)_-_44px)] short-desktop:max-h-[calc(var(--home-viewport-media)_-_32px)]"
              src={tile.image.src}
              alt={tile.image.alt}
              width={tile.image.width}
              height={tile.image.height}
              sizes="(min-width: 820px) 20vw, 45vw"
            />
            <span className="mt-2.5 block text-caption font-bold short-desktop:mt-1 short-desktop:text-ui">
              {tile.product.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const schema = createSchema({
  type: "kit-callout",
  title: "Kit callout",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
          defaultValue: "One-day kit",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Carry the day, not the doubt.",
        },
        {
          type: "text",
          name: "linkLabel",
          label: "Link label",
        },
        {
          type: "text",
          name: "productHandle",
          label: "Primary product handle",
        },
        {
          type: "textarea",
          name: "tileProductHandles",
          label: "Tile product handles, one per line",
        },
      ],
    },
  ],
});
