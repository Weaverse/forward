import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";

export default async function NotFound() {
  const [collections, themeContent] = await Promise.all([
    storefront.listCollections(),
    storefront.getThemeContent(),
  ]);
  const panelImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="grid border border-carbon lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="bg-acid px-6 py-12 text-carbon sm:px-10 lg:py-16">
          <p className="field-label">404 / Off route</p>
          <h1 className="display-huge mt-6">
            <span className="block">This trail</span>
            <span className="block">ends here.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed">
            The page may have moved, or the route was never marked. Return to
            familiar ground and choose another direction.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="field-label inline-flex min-h-11 items-center bg-carbon px-6 text-cream transition-colors hover:text-acid"
            >
              Return home
            </Link>
            <Link
              href="/shop"
              className="field-label inline-flex min-h-11 items-center border border-carbon px-6 text-carbon transition-colors hover:bg-carbon hover:text-cream"
            >
              Explore gear
            </Link>
          </div>
        </div>
        <Image
          src={panelImage.src}
          alt={panelImage.alt}
          width={panelImage.width}
          height={panelImage.height}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="h-full max-h-[20rem] w-full border-t border-carbon object-cover lg:max-h-none lg:border-l lg:border-t-0"
        />
      </div>
    </div>
  );
}
