import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";

/*
 * Home — a one-to-one port of the canonical `homePage()` (source
 * `app.js:212–250`): hero dossier, operating premise, image dossier, equipment
 * runway, dispatch feature, and the movement-system ground index.
 *
 * Roles resolve by stable handle through the normalized data source, never by
 * array index and never from fixtures directly:
 *
 *   IMG.climbing -> themeContent.homeHeroImage
 *   IMG.hike     -> collection `high-route` hero
 *   IMG.tent     -> collection `camp-craft` hero
 *   IMG.ridge    -> themeContent.standardBandImage
 *   runway       -> ridge-30-field-pack, weatherline-shell, talus-trail-shoe
 *   tiles        -> field-gear, high-route, camp-craft
 *   dispatch     -> first normalized journal article
 *
 * The canonical runway carries four fictional products; Forward has three real
 * ones. That count difference is intentional — no fourth product is invented.
 */

const RUNWAY_HANDLES = [
  "ridge-30-field-pack",
  "weatherline-shell",
  "talus-trail-shoe",
] as const;

const TILE_HANDLES = ["field-gear", "high-route", "camp-craft"] as const;

/** Splits a title so the canonical two-line headline treatment still works. */
function splitTitle(title: string): { lead: string; rest: string } {
  const firstSpace = title.indexOf(" ");
  if (firstSpace === -1) {
    return { lead: title, rest: "" };
  }
  return {
    lead: title.slice(0, firstSpace),
    rest: title.slice(firstSpace + 1),
  };
}

/** First sentence of a normalized description, for the compact tile copy. */
function firstSentence(text: string): string {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

export default async function HomePage() {
  const [themeContent, allProducts, allCollections, articles] =
    await Promise.all([
      storefront.getThemeContent(),
      storefront.listProducts(),
      storefront.listCollections(),
      storefront.listArticles(),
    ]);

  const byHandle = new Map<string, Product>(
    allProducts.map((product) => [product.handle, product]),
  );
  const collectionsByHandle = new Map<string, Collection>(
    allCollections.map((collection) => [collection.handle, collection]),
  );

  const runway = RUNWAY_HANDLES.map((handle) => byHandle.get(handle)).filter(
    (product): product is Product => product !== undefined,
  );
  const tiles = TILE_HANDLES.map((handle) =>
    collectionsByHandle.get(handle),
  ).filter((collection): collection is Collection => collection !== undefined);

  const traverseImage = collectionsByHandle.get("high-route")?.heroImage;
  const campImage = collectionsByHandle.get("camp-craft")?.heroImage;
  const dispatch = articles[0];
  const dispatchTitle =
    dispatch !== undefined ? splitTitle(dispatch.title) : undefined;
  const dispatchQuote = dispatch?.body.find(
    (block) => block.type === "pullquote",
  );
  const dispatchNumber = dispatch?.plate.replace(/\D/g, "") ?? "01";

  return (
    <div className="home-advanced">
      <section className="hero hero-advanced">
        <div className="hero-field-index" aria-hidden="true">
          <b>FORWARD / 01</b>
          <span>SPRING—AUTUMN</span>
          <span>54° 27′ 39″ N</span>
          <span>RANGE / WESTERN FELLS</span>
        </div>
        <div className="hero-media">
          <Image
            className="hero-image"
            src={themeContent.homeHeroImage.src}
            alt={themeContent.homeHeroImage.alt}
            width={themeContent.homeHeroImage.width}
            height={themeContent.homeHeroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
          <span className="hero-media-note">
            Plate 01 / Open sky, east face
          </span>
        </div>
        <div className="hero-content">
          <p className="eyebrow">FORWARD / High country system</p>
          <h1 className="display">
            <span>Move until</span>
            <em>
              the map
              <br className="mobile-only-break" /> runs out.
            </em>
          </h1>
          <p className="hero-sub">
            Purposeful layers and field equipment for uncertain weather, useful
            distance, and the quiet beyond the marked route.
          </p>
          <div className="hero-actions">
            <Link className="button button-signal" href="/shop">
              Enter the equipment index
            </Link>
            {dispatch !== undefined ? (
              <Link
                className="text-link hero-journal-link"
                href={`/journal/${dispatch.handle}`}
              >
                Dispatch {dispatch.plate}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="hero-condition">
          <span>Current field condition</span>
          <strong>Wind / W 18</strong>
          <strong>Visibility / Open</strong>
          <i>Static demonstration data</i>
        </div>
      </section>

      <section className="manifesto section shell">
        <div className="manifesto-number" aria-hidden="true">
          01
        </div>
        <div>
          <p className="eyebrow">Operating premise</p>
          <h2 className="h2">
            Carry less.
            <br />
            <i>Notice more.</i>
          </h2>
        </div>
        <div className="manifesto-copy">
          <p className="lede">
            We build adaptable outdoor goods around a strict premise: every
            piece must earn its weight, survive a change of plan, and become
            quieter with use.
          </p>
          <div className="manifesto-ledger">
            <span>
              <b>{String(allProducts.length).padStart(2, "0")}</b> core objects
            </span>
            <span>
              <b>{String(allCollections.length).padStart(2, "0")}</b> movement
              systems
            </span>
            <span>
              <b>01</b> lifetime repair desk
            </span>
          </div>
          <Link className="text-link" href="/pages/about-forward">
            Read the field standard
          </Link>
        </div>
      </section>

      <section className="image-dossier shell" aria-label="Field image dossier">
        {traverseImage !== undefined ? (
          <figure className="dossier-main">
            <Image
              src={traverseImage.src}
              alt={traverseImage.alt}
              width={traverseImage.width}
              height={traverseImage.height}
              sizes="(min-width: 560px) 63vw, 86vw"
            />
            <figcaption>Traverse study / 04</figcaption>
          </figure>
        ) : null}
        {campImage !== undefined ? (
          <figure className="dossier-inset">
            <Image
              src={campImage.src}
              alt={campImage.alt}
              width={campImage.width}
              height={campImage.height}
              sizes="(min-width: 560px) 34vw, 52vw"
            />
            <figcaption>Camp / 19:48</figcaption>
          </figure>
        ) : null}
        <div className="dossier-stamp" aria-hidden="true">
          <span>Tested beyond</span>
          <b>3,000 FT</b>
          <span>FORWARD / CUMBRIA</span>
        </div>
        <p className="dossier-caption">
          A clothing system should disappear while moving and become exactly
          enough when the weather turns.
        </p>
      </section>

      <section className="equipment-runway section shell">
        <div className="section-head runway-head">
          <div>
            <p className="eyebrow">
              Equipment index / 01—{String(runway.length).padStart(2, "0")}
            </p>
            <h2 className="h2">
              Objects for
              <br />
              <i>going farther.</i>
            </h2>
          </div>
          <p className="runway-note">
            Three pieces. One field system.
            <br />
            Built to layer, carry, and repair.
          </p>
          <Link className="text-link" href="/shop">
            Complete index
          </Link>
        </div>
        <div className="product-grid product-runway">
          {runway.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              index={String(index + 1).padStart(2, "0")}
              priority={index === 0}
            />
          ))}
        </div>
      </section>

      {dispatch !== undefined && dispatchTitle !== undefined ? (
        <section className="field-notes dispatch-feature">
          <div className="dispatch-image">
            <Image
              src={themeContent.standardBandImage.src}
              alt={themeContent.standardBandImage.alt}
              width={themeContent.standardBandImage.width}
              height={themeContent.standardBandImage.height}
              sizes="(min-width: 820px) 62vw, 100vw"
            />
            <span>
              {dispatch.location} / {dispatch.readingMinutes} min read /{" "}
              {dispatch.coordinates}
            </span>
          </div>
          <div className="field-copy">
            <p className="eyebrow">
              Dispatch {dispatch.plate} / {dispatch.location}
            </p>
            <h2 className="h2">
              {dispatchTitle.lead}
              <br />
              <i>{dispatchTitle.rest}</i>
            </h2>
            {dispatchQuote !== undefined ? (
              <blockquote>“{dispatchQuote.text}”</blockquote>
            ) : null}
            <p>{dispatch.excerpt}</p>
            <Link
              className="button button-light"
              href={`/journal/${dispatch.handle}`}
            >
              Open dispatch {dispatch.plate}
            </Link>
          </div>
          <span className="dispatch-issue" aria-hidden="true">
            {dispatchNumber}
          </span>
        </section>
      ) : null}

      <section className="ground-index section shell">
        <div className="section-head">
          <div>
            <p className="eyebrow">
              Movement systems / 01—{String(tiles.length).padStart(2, "0")}
            </p>
            <h2 className="h2">Choose your ground.</h2>
          </div>
        </div>
        <div className="activity-strip">
          {tiles.map((collection, index) => (
            <Link
              key={collection.handle}
              className="activity-tile"
              href={`/shop/${collection.handle}`}
            >
              <Image
                src={collection.heroImage.src}
                alt={collection.heroImage.alt}
                width={collection.heroImage.width}
                height={collection.heroImage.height}
                sizes="(min-width: 820px) 34vw, 100vw"
              />
              <span className="tile-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="activity-tile-content">
                <p className="eyebrow">{collection.fieldCode}</p>
                <h3 className="h3">{collection.title}</h3>
                <p>{firstSentence(collection.description)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
