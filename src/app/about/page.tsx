import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "About Forward",
  description: "The product principles and field standard behind Forward.",
};

export default async function AboutCustomPage() {
  const [theme, products, collections] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
  ]);
  return (
    <div className="custom-story-page">
      <section className="custom-story-hero">
        <div>
          <p className="eyebrow">Custom page / About Forward</p>
          <h1>Make less equipment. Make every piece matter.</h1>
          <p className="lede">
            Forward is built around complete movement systems rather than
            seasonal noise: fewer products, clearer jobs, longer useful lives.
          </p>
        </div>
        <Image
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="custom-story-manifesto shell section">
        <p className="eyebrow">The Forward standard</p>
        <h2>Useful over novel. Repairable over disposable. Quiet over loud.</h2>
        <div className="custom-story-columns">
          <p>
            We begin with the work a product must do, then remove anything that
            does not improve movement, protection, carry, or recovery.
          </p>
          <p>
            Materials are selected for known performance and honest aging. A
            worn product should carry evidence of use—not become obsolete.
          </p>
          <p>
            Every core object belongs to a system, so layers and equipment earn
            their place together instead of competing for attention.
          </p>
        </div>
      </section>
      <section className="custom-story-stats">
        <div>
          <strong>{products.length}</strong>
          <span className="custom-story-stat-label">core objects</span>
        </div>
        <div>
          <strong>{collections.length - 1}</strong>
          <span className="custom-story-stat-label">movement systems</span>
        </div>
        <div>
          <strong>01</strong>
          <span className="custom-story-stat-label">repair commitment</span>
        </div>
      </section>
      <section className="section shell">
        <header className="home-commerce-head">
          <div>
            <p className="eyebrow">Representative equipment</p>
            <h2 className="h2">The standard, made physical.</h2>
          </div>
          <Link className="text-link" href="/shop">
            Complete catalog
          </Link>
        </header>
        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
