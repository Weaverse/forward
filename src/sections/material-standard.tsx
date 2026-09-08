import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import {
  cta,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";

interface MaterialStandardProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  image: StorefrontImage;
}

/** Dark editorial band pairing the material story with a wide image. */
function MaterialStandard({
  eyebrowLabel,
  heading,
  body,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  image,
}: MaterialStandardProps) {
  return (
    <section className="grid grid-cols-split-85 bg-ink text-text-inverse max-md:grid-cols-1">
      <div className="flex flex-col justify-center p-[clamp(48px,7vw,110px)]">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
        <p className="mb-prose-paragraph max-w-state text-copy-lg text-text-dark-subtle">
          {body}
        </p>
        <div className="mt-8.5 flex flex-wrap items-center gap-6">
          <Link className={cta({ intent: "light" })} href={primaryCtaHref}>
            {primaryCtaLabel}
          </Link>
          <Link className={textLink()} href={secondaryCtaHref}>
            {secondaryCtaLabel}
          </Link>
        </div>
      </div>
      <Image
        className="h-175 object-cover saturate-70 max-md:h-[58svh]"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 820px) 55vw, 100vw"
      />
    </section>
  );
}

export default MaterialStandard;

export const schema = createSchema({
  type: "material-standard",
  title: "Material standard",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
          defaultValue: "Material standard",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
        },
        {
          type: "textarea",
          name: "body",
          label: "Body",
        },
        {
          type: "text",
          name: "primaryCtaLabel",
          label: "Primary CTA label",
        },
        {
          type: "url",
          name: "primaryCtaHref",
          label: "Primary CTA link",
        },
        {
          type: "text",
          name: "secondaryCtaLabel",
          label: "Secondary CTA label",
        },
        {
          type: "url",
          name: "secondaryCtaHref",
          label: "Secondary CTA link",
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
