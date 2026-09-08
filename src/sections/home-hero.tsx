import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  cta,
  eyebrow,
  LEDE_CLASS,
  textLink,
} from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";

interface HomeHeroProps {
  eyebrowLabel: string;
  heading: string;
  lede: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  stats: readonly { label: string; value: string }[];
  image: StorefrontImage;
  /** Optional badge linking out of the hero image to one product. */
  featuredProduct?: Product;
}

/** Home hero: split copy and image, with a summary stat row and image badge. */
function HomeHero({
  eyebrowLabel,
  heading,
  lede,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  stats,
  image,
  featuredProduct,
}: HomeHeroProps) {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="grid min-h-[calc(100svh_-_var(--spacing-header))] grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] bg-ink text-text-inverse max-md:min-h-[calc(100svh_-_var(--spacing-header-compact))] max-md:grid-cols-1"
    >
      <div className="flex flex-col justify-center p-[clamp(48px,6vw,100px)] max-md:px-page-gutter max-md:py-13.75">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h1
          className="mt-5.5 mb-7 max-w-190 text-balance font-heading text-home-hero leading-home-hero font-medium tracking-home-hero max-md:text-home-hero-mobile"
          id="home-hero-title"
        >
          {heading}
        </h1>
        <p className={cn(LEDE_CLASS, "max-w-142.5 text-text-dark-subtle")}>
          {lede}
        </p>
        <div className="mt-8.5 flex flex-wrap items-center gap-6">
          <Link className={cta({ intent: "signal" })} href={primaryCtaHref}>
            {primaryCtaLabel}
          </Link>
          <Link className={textLink()} href={secondaryCtaHref}>
            {secondaryCtaLabel}
          </Link>
        </div>
        <dl className="mt-auto grid grid-cols-3 border-border-dark-subtle border-t pt-9 max-md:mt-11.25">
          {stats.map((stat) => (
            <div className="grid gap-1.5" key={stat.label}>
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                {stat.label}
              </dt>
              <dd className="m-0 font-heading text-heading-4">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative m-5 min-h-190 overflow-hidden max-md:mx-2.5 max-md:mt-0 max-md:mb-2.5 max-md:min-h-[68svh]">
        <Image
          className="absolute inset-0 h-full object-cover saturate-78 contrast-105"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 820px) 58vw, 100vw"
          priority
        />
        {featuredProduct !== undefined ? (
          <Link
            className="absolute right-4.5 bottom-4.5 grid w-[min(330px,calc(100%_-_36px))] gap-2 bg-signal p-5 text-ink"
            href={`/products/${featuredProduct.handle}`}
          >
            <span className="font-field-meta text-micro uppercase">
              Featured system
            </span>
            <strong className="font-heading text-home-feature-title">
              {featuredProduct.title}
            </strong>
            <span className="font-field-meta text-micro uppercase">
              View product →
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default HomeHero;

export const schema = createSchema({
  type: "home-hero",
  title: "Home hero",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
          defaultValue: "Forward / Field equipment 2026",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Equipment for weather that changes the plan.",
        },
        {
          type: "textarea",
          name: "lede",
          label: "Lede",
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
        {
          type: "text",
          name: "featuredProductHandle",
          label: "Featured product handle",
        },
      ],
    },
  ],
});
