import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
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
    <div>
      <section className="mt-5.5 mr-7 ml-7 grid min-h-page-min grid-cols-split-90 bg-ink text-text-inverse max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0 max-md:grid-cols-1">
        <div className="order-2 flex flex-col justify-center p-panel-wide max-md:order-1 max-md:px-page-gutter max-md:py-13.75">
          <p className={eyebrow()}>Custom page / Material library</p>
          <h1 className="mt-5 mb-7.5 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile">
            Performance begins with what a product is made from.
          </h1>
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            We use a short material vocabulary, document what each element is
            for, and design care around extending its useful life.
          </p>
        </div>
        <Image
          className="order-1 h-full object-cover saturate-72 max-md:order-2 max-md:h-home-media-mobile"
          src={theme.standardBandImage.src}
          alt={theme.standardBandImage.alt}
          width={theme.standardBandImage.width}
          height={theme.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="mx-auto grid w-full max-w-page grid-cols-3 gap-px bg-ink p-px max-md:grid-cols-1">
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
          <article
            key={number}
            className="min-h-105 bg-text-inverse p-11.25 max-md:min-h-0"
          >
            <span className="font-field-meta text-signal-strong">{number}</span>
            <h2 className="mt-20 text-balance font-heading text-material-title max-md:mt-8.75">
              {title}
            </h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="grid grid-cols-3 bg-ink max-md:grid-cols-1">
        {representatives.map(({ product, image }) => (
          <Link
            className="relative min-h-162.5 text-text-inverse max-md:min-h-150"
            href={`/products/${product.handle}`}
            key={product.handle}
          >
            <Image
              className="h-full object-cover saturate-65"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 820px) 34vw, 100vw"
            />
            <div className="absolute right-5 bottom-5 left-5 grid gap-1.75 bg-ink/92 p-5">
              <span>{product.category}</span>
              <strong>{product.title}</strong>
              <span>Inspect product →</span>
            </div>
          </Link>
        ))}
      </section>
      <section className="mx-auto grid w-full max-w-page grid-cols-spec-row items-end gap-11.25 px-page-gutter py-section-block max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>Care + repair</p>
          <h2 className={sectionHeading()}>
            Maintenance is part of performance.
          </h2>
        </div>
        <p>
          Clean only when needed, restore water repellency before replacing a
          shell, and send structural damage to the repair desk.
        </p>
        <Link className={cta()} href="/pages/field-repair">
          Repair programme
        </Link>
      </section>
    </div>
  );
}
