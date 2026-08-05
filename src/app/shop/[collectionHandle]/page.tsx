import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";

interface CollectionPageProps {
  params: Promise<{ collectionHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const collections = await storefront.listCollections();
  return collections.map((collection) => ({
    collectionHandle: collection.handle,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collectionHandle } = await params;
  const collection = await storefront.getCollection(collectionHandle);
  if (collection === null) {
    return { title: "Collection not found" };
  }
  return {
    title: `${collection.title} · Shop`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionHandle } = await params;
  const [collection, products, allCollections] = await Promise.all([
    storefront.getCollection(collectionHandle),
    storefront.getCollectionProducts(collectionHandle),
    storefront.listCollections(),
  ]);
  if (collection === null || products === null) {
    notFound();
  }

  return (
    <div>
      {/* Collection lead: image plane beside a solid copy panel. */}
      <section className="border-b border-mist bg-parchment">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Image
            src={collection.heroImage.src}
            alt={collection.heroImage.alt}
            width={collection.heroImage.width}
            height={collection.heroImage.height}
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="max-h-[26rem] w-full object-cover lg:max-h-none"
          />
          <div className="flex flex-col justify-center gap-4 border-t border-mist px-5 py-10 sm:px-8 lg:border-l lg:border-t-0 lg:py-16">
            <p className="field-label text-clay">
              Collection {collection.fieldCode}
            </p>
            <h1 className="font-display text-4xl text-pine sm:text-5xl">
              {collection.title}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-slate">
              {collection.description}
            </p>
            <p className="field-label text-slate">
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              in this kit
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <nav aria-label="Collections" className="border-b border-mist pb-3">
          <ul className="flex flex-wrap items-center gap-1">
            {allCollections.map((entry) => {
              const selected = entry.handle === collection.handle;
              return (
                <li key={entry.handle}>
                  <Link
                    href={`/shop/${entry.handle}`}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "field-label inline-flex min-h-11 items-center px-4 transition-colors",
                      selected
                        ? "bg-pine text-bone"
                        : "text-slate hover:text-pine",
                    )}
                  >
                    {entry.title}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/shop"
                className="field-label inline-flex min-h-11 items-center px-4 text-slate transition-colors hover:text-pine"
              >
                All products
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              plate={product.plate}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
