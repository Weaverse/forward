import Image from "next/image";
import Link from "next/link";

import { cta, sectionHeading } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";

/** Shared accessible 404 for the root and every unknown dynamic handle. */
export default async function NotFound() {
  const [collections, themeContent] = await Promise.all([
    storefront.listCollections(),
    storefront.getThemeContent(),
  ]);
  const panelImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;

  return (
    <div className="m-6 grid min-h-[72svh] grid-cols-[0.65fr_1.35fr] border border-ink max-md:m-3 max-md:grid-cols-1">
      <section className="flex flex-col justify-center bg-signal p-page-gutter max-md:min-h-[55svh]">
        <span className="mb-7 font-field-meta text-[13px] font-medium text-signal-strong tracking-field-meta">
          404 / Off route
        </span>
        <h1 className={sectionHeading({ size: "display" })}>
          This trail ends here.
        </h1>
        <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
          The page may have moved, or the route was never marked. Return to
          familiar ground and choose another direction.
        </p>
        <div className="flex flex-wrap gap-3 max-sm:flex-col max-sm:items-stretch">
          <Link className={`${cta()} max-sm:w-full`} href="/">
            Return home
          </Link>
          <Link
            className={`${cta({ intent: "outline" })} max-sm:w-full`}
            href="/shop"
          >
            Explore gear
          </Link>
        </div>
      </section>
      <div className="max-md:min-h-[50svh]">
        <Image
          className="h-full object-cover"
          src={panelImage.src}
          alt={panelImage.alt}
          width={panelImage.width}
          height={panelImage.height}
          sizes="(min-width: 820px) 68vw, 100vw"
        />
      </div>
    </div>
  );
}
