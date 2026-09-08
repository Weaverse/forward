import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { cta, eyebrow } from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";

interface ProductCaseStudyProps {
  eyebrowLabel: string;
  ctaLabel: string;
  product: Product;
  image: StorefrontImage;
}

/** A single product examined in depth: description, spec list, and image. */
function ProductCaseStudy({
  eyebrowLabel,
  ctaLabel,
  product,
  image,
}: ProductCaseStudyProps) {
  return (
    <section className="grid grid-cols-split-75 bg-ink text-text-inverse max-md:grid-cols-1">
      <div className="self-center p-[clamp(50px,7vw,110px)] max-md:order-2">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className="text-balance font-heading text-field-case-title leading-field-case">
          {product.title}
        </h2>
        <p>{product.description}</p>
        <dl className="my-8.75 border-border-dark border-t">
          {product.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between border-border-dark border-b py-3.25"
            >
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        <Link
          className={cta({ intent: "light" })}
          href={`/products/${product.handle}`}
        >
          {ctaLabel}
        </Link>
      </div>
      <Image
        className="h-190 object-cover max-md:h-[62svh]"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 820px) 55vw, 100vw"
      />
    </section>
  );
}

export default ProductCaseStudy;

export const schema = createSchema({
  type: "product-case-study",
  title: "Product case study",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "text",
          name: "ctaLabel",
          label: "CTA label",
        },
        {
          type: "text",
          name: "productHandle",
          label: "Product handle",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
      ],
    },
  ],
});
