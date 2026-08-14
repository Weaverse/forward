import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";

export const revalidate = 3600;

const FEATURED_HANDLES = [
  "weatherline-shell",
  "traverse-grid-fleece",
  "ridge-30-field-pack",
  "talus-trail-shoe",
] as const;

const CATEGORY_HANDLES = ["outerwear", "packs", "footwear"] as const;

export default async function HomePage() {
  const [themeContent, products, collections, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
    storefront.listArticles(),
  ]);
  const productsByHandle = new Map<string, Product>(
    products.map((product) => [product.handle, product]),
  );
  const collectionsByHandle = new Map<string, Collection>(
    collections.map((collection) => [collection.handle, collection]),
  );
  const featured = FEATURED_HANDLES.map((handle) =>
    productsByHandle.get(handle),
  ).filter((product): product is Product => product !== undefined);
  const categories = CATEGORY_HANDLES.map((handle) =>
    collectionsByHandle.get(handle),
  ).filter((collection): collection is Collection => collection !== undefined);
  const spotlight = productsByHandle.get("drift-insulated-vest") ?? featured[0];
  const pack = productsByHandle.get("approach-18-day-pack") ?? featured[1];
  const dispatch = articles[0];
  const spotlightImage = spotlight?.colorways[0]?.images.context;
  const kitProducts = featured.slice(0, 3).flatMap((product) => {
    const image = product.colorways[0]?.images.primary;
    return image === undefined ? [] : [{ product, image }];
  });

  return (
    <div className="commerce-home">
      <section className="commerce-hero">
        <div className="commerce-hero-copy">
          <p className="eyebrow">Forward / Field equipment 2026</p>
          <h1 className="display">
            Equipment for weather that changes the plan.
          </h1>
          <p className="lede">
            Layerable apparel, precise footwear, and low-profile carry systems
            made to move together.
          </p>
          <div className="commerce-hero-actions">
            <Link className="button button-signal" href="/shop">
              Shop all equipment
            </Link>
            <Link className="text-link" href="/field-testing">
              How we test
            </Link>
          </div>
          <dl className="commerce-hero-facts">
            <div>
              <dt>Systems</dt>
              <dd>{categories.length}</dd>
            </div>
            <div>
              <dt>Core objects</dt>
              <dd>{products.length}</dd>
            </div>
            <div>
              <dt>Repair</dt>
              <dd>For life</dd>
            </div>
          </dl>
        </div>
        <div className="commerce-hero-media">
          <Image
            src={themeContent.homeHeroImage.src}
            alt={themeContent.homeHeroImage.alt}
            width={themeContent.homeHeroImage.width}
            height={themeContent.homeHeroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
          {featured[0] !== undefined ? (
            <Link
              className="commerce-hero-product"
              href={`/products/${featured[0].handle}`}
            >
              <span className="commerce-hero-product-meta">
                Featured system
              </span>
              <strong>{featured[0].title}</strong>
              <span className="commerce-hero-product-meta">View product →</span>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="home-shop-section section shell">
        <header className="home-commerce-head">
          <div>
            <p className="eyebrow">New field rotation</p>
            <h2 className="h2">Start with the core four.</h2>
          </div>
          <p>
            A weather layer, breathable midlayer, close-body carry, and trail
            shoe form the shortest route to a complete Forward system.
          </p>
          <Link className="text-link" href="/shop">
            Shop all {products.length}
          </Link>
        </header>
        <div className="product-grid home-featured-grid">
          {featured.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="home-system-section">
        <header className="home-system-intro shell">
          <p className="eyebrow">Shop by system</p>
          <h2 className="h2">Built separately. Better together.</h2>
        </header>
        <div className="home-system-grid">
          {categories.map((collection) => (
            <Link
              className="home-system-card"
              href={`/shop/${collection.handle}`}
              key={collection.handle}
            >
              <Image
                src={collection.heroImage.src}
                alt={collection.heroImage.alt}
                width={collection.heroImage.width}
                height={collection.heroImage.height}
                sizes="(min-width: 820px) 34vw, 100vw"
              />
              <div>
                <span className="eyebrow">{collection.fieldCode}</span>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <span>Shop system →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {spotlight !== undefined && spotlightImage !== undefined ? (
        <section className="home-spotlight shell section">
          <div className="home-spotlight-media">
            <Image
              src={spotlightImage.src}
              alt={spotlightImage.alt}
              width={spotlightImage.width}
              height={spotlightImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
            />
          </div>
          <div className="home-spotlight-copy">
            <p className="eyebrow">Layer focus / {spotlight.category}</p>
            <h2 className="h2">{spotlight.title}</h2>
            <p className="lede">{spotlight.description}</p>
            <ul>
              {spotlight.specs.slice(0, 3).map((spec) => (
                <li key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </li>
              ))}
            </ul>
            <Link
              className="button button-primary"
              href={`/products/${spotlight.handle}`}
            >
              Explore the layer
            </Link>
          </div>
        </section>
      ) : null}

      <section className="home-proof-band">
        <div className="home-proof-copy">
          <p className="eyebrow">Material standard</p>
          <h2 className="h2">Fewer materials. Better understood.</h2>
          <p>
            Every fabric, foam, buckle, and compound is selected around useful
            life, field repair, and performance you can actually feel.
          </p>
          <div className="home-proof-links">
            <Link className="button button-light" href="/materials">
              Explore materials
            </Link>
            <Link className="text-link" href="/about">
              About Forward
            </Link>
          </div>
        </div>
        <Image
          src={themeContent.standardBandImage.src}
          alt={themeContent.standardBandImage.alt}
          width={themeContent.standardBandImage.width}
          height={themeContent.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      </section>

      {pack !== undefined ? (
        <section className="home-kit shell section">
          <div className="home-kit-copy">
            <p className="eyebrow">One-day kit</p>
            <h2 className="h2">Carry the day, not the doubt.</h2>
            <p>{pack.description}</p>
            <Link className="text-link" href={`/products/${pack.handle}`}>
              View {pack.title}
            </Link>
          </div>
          <div className="home-kit-products">
            {kitProducts.map(({ product, image }) => (
              <Link href={`/products/${product.handle}`} key={product.handle}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 820px) 20vw, 45vw"
                />
                <span className="home-kit-product-name">{product.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="home-service-grid shell section">
        <article>
          <p className="eyebrow">Repair, not replace</p>
          <h2>Keep equipment in motion.</h2>
          <p>
            Product defects are repaired free. Wear, accidents, and hard-earned
            damage are assessed honestly before work begins.
          </p>
          <Link className="text-link" href="/pages/field-repair">
            Visit the repair desk
          </Link>
        </article>
        {dispatch !== undefined ? (
          <article className="home-dispatch-card">
            <Image
              src={dispatch.heroImage.src}
              alt={dispatch.heroImage.alt}
              width={dispatch.heroImage.width}
              height={dispatch.heroImage.height}
              sizes="(min-width: 820px) 45vw, 100vw"
            />
            <div>
              <p className="eyebrow">Latest field note</p>
              <h2>{dispatch.title}</h2>
              <p>{dispatch.excerpt}</p>
              <Link className="text-link" href={`/journal/${dispatch.handle}`}>
                Read the dispatch
              </Link>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
