import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  cta,
  eyebrow,
  LEDE_CLASS,
  SHELL_SECTION_CLASS,
  sectionHeading,
  VIEWPORT_SECTION_CLASS,
} from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";

interface ProductSpotlightProps {
  eyebrowPrefix: string;
  ctaLabel: string;
  /** How many of the product's specs to list. */
  specCount: number;
  product: Product;
  image: StorefrontImage;
}

/** One product examined beside a tall image, with a short spec list. */
export function ProductSpotlight({
  eyebrowPrefix,
  ctaLabel,
  specCount,
  product,
  image,
}: ProductSpotlightProps) {
  return (
    <section
      className={cn(
        SHELL_SECTION_CLASS,
        "grid grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)] gap-0 max-md:grid-cols-1",
        VIEWPORT_SECTION_CLASS,
      )}
    >
      <div>
        <Image
          className="min-h-0 aspect-4/5 object-cover md-up:h-(--home-viewport-media) md-up:aspect-auto"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 820px) 60vw, 100vw"
        />
      </div>
      <div className="flex flex-col justify-center bg-surface-subtle p-[clamp(42px,6vw,92px)] md-up:px-[clamp(28px,4vw,60px)] md-up:py-[clamp(24px,4svh,48px)] short-desktop:px-[clamp(20px,3vw,36px)] short-desktop:py-2">
        <p className={cn(eyebrow(), "short-desktop:mb-1")}>
          {eyebrowPrefix} {product.category}
        </p>
        <h2
          className={cn(
            sectionHeading(),
            "md-up:text-spotlight-title short-desktop:mb-1 short-desktop:text-spotlight-title-short short-desktop:leading-display-relaxed",
          )}
        >
          {product.title}
        </h2>
        <p
          className={cn(
            LEDE_CLASS,
            "md-up:mb-[clamp(10px,2svh,18px)] md-up:text-spotlight-copy md-up:leading-spotlight-copy short-desktop:mb-1 short-desktop:text-spotlight-copy-short short-desktop:leading-spotlight-copy-short",
          )}
        >
          {product.subtitle}
        </p>
        <ul className="my-7.5 list-none border-border-subtle border-t p-0 md-up:my-[clamp(14px,2.5svh,24px)] short-desktop:my-1">
          {product.specs.slice(0, specCount).map((spec) => (
            <li
              key={spec.label}
              className="flex justify-between gap-5 border-border-subtle border-b py-3.5 text-caption md-up:py-[clamp(8px,1.7svh,14px)] short-desktop:py-[clamp(3px,1svh,6px)] short-desktop:text-ui"
            >
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </li>
          ))}
        </ul>
        <Link
          className={cn(
            cta(),
            "self-start short-desktop:min-h-10 short-desktop:py-2",
          )}
          href={`/products/${product.handle}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
