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
      <section className="mt-[22px] mr-7 ml-7 grid min-h-[82svh] grid-cols-[0.9fr_1.1fr] bg-ink text-text-inverse max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0 max-md:grid-cols-1">
        <div className="order-2 flex flex-col justify-center p-[clamp(45px,6vw,95px)] max-md:order-1 max-md:px-page-gutter max-md:py-[55px]">
          <p className={eyebrow()}>Custom page / Material library</p>
          <h1 className="mt-5 mb-[30px] text-balance font-heading text-[clamp(58px,7vw,112px)] leading-[0.9] tracking-[-0.06em] max-md:text-[clamp(50px,15vw,76px)]">
            Performance begins with what a product is made from.
          </h1>
          <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
            We use a short material vocabulary, document what each element is
            for, and design care around extending its useful life.
          </p>
        </div>
        <Image
          className="order-1 h-full object-cover saturate-[0.72] max-md:order-2 max-md:h-[60svh]"
          src={theme.standardBandImage.src}
          alt={theme.standardBandImage.alt}
          width={theme.standardBandImage.width}
          height={theme.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-3 gap-px bg-ink p-px max-md:grid-cols-1">
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
            className="min-h-[420px] bg-text-inverse p-[45px] max-md:min-h-0"
          >
            <span className="font-field-meta text-signal-strong">{number}</span>
            <h2 className="mt-20 text-balance font-heading text-[38px] max-md:mt-[35px]">
              {title}
            </h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="grid grid-cols-3 bg-ink max-md:grid-cols-1">
        {representatives.map(({ product, image }) => (
          <Link
            className="relative min-h-[650px] text-text-inverse max-md:min-h-[600px]"
            href={`/products/${product.handle}`}
            key={product.handle}
          >
            <Image
              className="h-full object-cover saturate-[0.65]"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 820px) 34vw, 100vw"
            />
            <div className="absolute right-5 bottom-5 left-5 grid gap-[7px] bg-ink/92 p-5">
              <span>{product.category}</span>
              <strong>{product.title}</strong>
              <span>Inspect product →</span>
            </div>
          </Link>
        ))}
      </section>
      <section className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[1fr_0.7fr_auto] items-end gap-[45px] px-page-gutter py-[clamp(70px,9vw,140px)] max-md:grid-cols-1">
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
