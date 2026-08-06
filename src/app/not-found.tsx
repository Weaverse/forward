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
    <div className="not-found">
      <section className="not-found-copy">
        <span className="code-404">404 / Off route</span>
        <h1 className="h1">This trail ends here.</h1>
        <p className="lede">
          The page may have moved, or the route was never marked. Return to
          familiar ground and choose another direction.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">
            Return home
          </Link>
          <Link className="button" href="/shop">
            Explore gear
          </Link>
        </div>
      </section>
      <div className="not-found-image">
        <Image
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
