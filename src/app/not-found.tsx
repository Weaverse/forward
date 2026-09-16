import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
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
    <div className="m-3 grid min-h-[72svh] grid-cols-1 border border-ink md:m-6 md:grid-cols-split-65">
      <section className="flex min-h-[55svh] flex-col justify-center bg-signal p-page-gutter md:min-h-auto">
        <span className="mb-7 font-field-meta text-label font-medium text-signal-strong tracking-field-meta">
          404 / Off route
        </span>
        <h1 className={sectionHeading({ size: "display" })}>
          This trail ends here.
        </h1>
        <p className="max-w-lede text-lede leading-lede text-text-muted">
          The page may have moved, or the route was never marked. Return to
          familiar ground and choose another direction.
        </p>
        <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row">
          <Link className={cn(cta(), "w-full sm:w-auto")} href="/">
            Return home
          </Link>
          <Link className={cn(cta(), "w-full sm:w-auto")} href="/shop">
            Explore gear
          </Link>
        </div>
      </section>
      <div className="min-h-[50svh] md:min-h-auto">
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
