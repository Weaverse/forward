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
      {/* Dark editorial masthead with the collection image plane. */}
      <section
        data-surface="dark"
        className="bg-carbon text-cream"
        aria-label="Collection masthead"
      >
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col justify-end gap-6 px-5 pb-12 pt-10 sm:px-8 lg:py-16">
            <p className="field-label text-acid">
              Movement system / {collection.fieldCode}
            </p>
            <h1 className="display-huge">{collection.title}</h1>
            <p className="max-w-md text-base leading-relaxed text-cream/75">
              {collection.description}
            </p>
          </div>
          <div className="relative">
            <Image
              src={collection.heroImage.src}
              alt={collection.heroImage.alt}
              width={collection.heroImage.width}
              height={collection.heroImage.height}
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-full max-h-[24rem] w-full object-cover lg:max-h-none"
            />
            <span
              aria-hidden="true"
              className="field-label absolute left-4 top-4 bg-carbon/80 px-2 py-1 text-cream"
            >
              {collection.fieldCode}
            </span>
          </div>
        </div>
      </section>

      {/* Acid rail: count + collection index links. */}
      <div className="border-b border-carbon bg-acid">
        <nav
          aria-label="Collections"
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-2 sm:px-8"
        >
          <p className="field-label text-carbon">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            in this kit
          </p>
          <ul className="flex flex-wrap items-center">
            {allCollections.map((entry) => {
              const selected = entry.handle === collection.handle;
              return (
                <li key={entry.handle}>
                  <Link
                    href={`/shop/${entry.handle}`}
                    aria-current={selected ? "page" : undefined}
                    data-surface={selected ? "dark" : undefined}
                    className={cn(
                      "field-label inline-flex min-h-11 items-center px-3 transition-colors",
                      selected
                        ? "bg-carbon text-acid"
                        : "text-carbon hover:bg-carbon/10",
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
                className="field-label inline-flex min-h-11 items-center px-3 text-carbon transition-colors hover:bg-carbon/10"
              >
                All products
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              plate={product.plate}
              stagger={index % 3 === 1}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
