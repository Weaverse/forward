import Image from "next/image";
import { Link } from "@/components/link";
import { eyebrow } from "@/lib/presentation/variants";
import type { Collection } from "@/lib/storefront/types";

/**
 * A full-height collection card linking to its `/shop/<handle>` page. It
 * carries its own dark ground, so a collection with no image stays readable
 * on a light page.
 */
export function CollectionCard({
  collection,
  linkLabel,
}: {
  collection: Collection;
  linkLabel: string;
}) {
  return (
    <Link
      className="group relative min-h-150 overflow-hidden border-border-dark-divider border-r bg-ink text-text-inverse after:absolute after:inset-x-0 after:top-2/5 after:bottom-0 after:bg-system-card-overlay after:content-[''] md:min-h-177.5"
      href={`/shop/${collection.handle}`}
    >
      {collection.heroImage === null ? null : (
        <Image
          className="h-full object-cover saturate-72 transition-transform duration-500 ease-standard group-hover:scale-102.5"
          src={collection.heroImage.src}
          alt={collection.heroImage.alt}
          width={collection.heroImage.width}
          height={collection.heroImage.height}
          sizes="(min-width: 820px) 34vw, 100vw"
        />
      )}
      <div className="absolute right-0 bottom-0 left-0 z-1 p-8.5">
        <span className={eyebrow({ tone: "warm" })}>
          {collection.fieldCode}
        </span>
        <h3 className="mt-2 mb-4 font-heading text-system-title leading-display-relaxed">
          {collection.title}
        </h3>
        <p className="mb-prose-paragraph max-w-105 text-text-dark-subtle">
          {collection.description}
        </p>
        <span className="mt-6 block font-body text-ui uppercase">
          {linkLabel}
        </span>
      </div>
    </Link>
  );
}
