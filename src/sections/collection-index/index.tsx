"use client";

import Image from "next/image";
import Link from "next/link";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import type { Collection } from "@/lib/storefront/types";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface CollectionIndexProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  /** Resolved by `./loader` from the merchant's collection selection. */
  loaderData?: { collections: readonly Collection[] };
}

/** Full-height collection cards, one per movement system. */
function CollectionIndex({
  eyebrowLabel,
  heading,
  loaderData,
  ...rest
}: CollectionIndexProps) {
  const collections = loaderData?.collections ?? [];
  return (
    <section
      {...elementAttributes(rest)}
      className="bg-ink pt-20 text-text-inverse"
    >
      <header className="mx-auto w-full max-w-page px-page-gutter pb-11">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
      </header>
      <div className="grid grid-cols-3 max-md:grid-cols-1">
        {collections.map((collection) => (
          <Link
            className="group relative min-h-177.5 overflow-hidden border-border-dark-divider border-r text-text-inverse after:absolute after:inset-x-0 after:top-2/5 after:bottom-0 after:bg-system-card-overlay after:content-[''] max-md:min-h-150"
            href={`/shop/${collection.handle}`}
            key={collection.handle}
          >
            <Image
              className="h-full object-cover saturate-72 transition-transform duration-500 ease-standard group-hover:scale-102.5"
              src={collection.heroImage.src}
              alt={collection.heroImage.alt}
              width={collection.heroImage.width}
              height={collection.heroImage.height}
              sizes="(min-width: 820px) 34vw, 100vw"
            />
            <div className="absolute right-0 bottom-0 left-0 z-1 p-8.5">
              <span className={eyebrow()}>{collection.fieldCode}</span>
              <h3 className="mt-2 mb-4 font-heading text-system-title leading-display-relaxed">
                {collection.title}
              </h3>
              <p className="mb-prose-paragraph max-w-105 text-text-dark-subtle">
                {collection.description}
              </p>
              <span className="mt-6 block font-body text-ui uppercase">
                Shop system →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CollectionIndex;

export { schema } from "./schema";
