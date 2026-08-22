import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";

/**
 * 404 — port of the canonical `notFoundPage()` (source `app.js:340`): the
 * bordered signal copy panel beside a full-bleed image plane. Serves the root
 * 404 and every unknown dynamic handle.
 */
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
        <h1 className="m-0 text-balance font-heading text-display leading-[0.94] font-medium tracking-heading">
          This trail ends here.
        </h1>
        <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
          The page may have moved, or the route was never marked. Return to
          familiar ground and choose another direction.
        </p>
        <div className="flex flex-wrap gap-3 max-sm:flex-col max-sm:items-stretch">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0 max-sm:w-full"
            href="/"
          >
            Return home
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-transparent px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0 max-sm:w-full"
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
