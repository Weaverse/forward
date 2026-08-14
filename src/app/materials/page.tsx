import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Materials",
  description: "Forward material choices, care principles, and repair intent.",
};

export default async function MaterialsCustomPage() {
  const [theme, products] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
  ]);
  const representatives = [products[0], products[3], products[6]].flatMap(
    (product) => {
      const image = product?.colorways[0]?.images.detail;
      return product === undefined || image === undefined
        ? []
        : [{ product, image }];
    },
  );
  return (
    <div className="custom-story-page material-page">
      <section className="custom-story-hero custom-story-hero-reverse">
        <div>
          <p className="eyebrow">Custom page / Material library</p>
          <h1>Performance begins with what a product is made from.</h1>
          <p className="lede">
            We use a short material vocabulary, document what each element is
            for, and design care around extending its useful life.
          </p>
        </div>
        <Image
          src={theme.standardBandImage.src}
          alt={theme.standardBandImage.alt}
          width={theme.standardBandImage.width}
          height={theme.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="material-principles shell section">
        {[
          [
            "01",
            "Protect without excess",
            "Shell fabrics and insulation are tuned around weather protection, movement, and packability—not maximum numbers in isolation.",
          ],
          [
            "02",
            "Carry without distraction",
            "Foams, webbing, and hardware are selected to stabilize a load while keeping adjustment and repair straightforward.",
          ],
          [
            "03",
            "Grip with feedback",
            "Footwear compounds balance traction, ground feel, and controlled wear across mixed trail and rock.",
          ],
        ].map(([number, title, copy]) => (
          <article key={number}>
            <span className="material-principle-number">{number}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="material-product-band">
        {representatives.map(({ product, image }) => (
          <Link href={`/products/${product.handle}`} key={product.handle}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 820px) 34vw, 100vw"
            />
            <div>
              <span>{product.category}</span>
              <strong>{product.title}</strong>
              <span>Inspect product →</span>
            </div>
          </Link>
        ))}
      </section>
      <section className="custom-story-cta shell section">
        <div>
          <p className="eyebrow">Care + repair</p>
          <h2 className="h2">Maintenance is part of performance.</h2>
        </div>
        <p>
          Clean only when needed, restore water repellency before replacing a
          shell, and send structural damage to the repair desk.
        </p>
        <Link className="button button-primary" href="/pages/field-repair">
          Repair programme
        </Link>
      </section>
    </div>
  );
}
