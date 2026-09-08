import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";
import { CollectionIndex } from "@/sections/collection-index";
import { FeaturedProducts } from "@/sections/featured-products";
import { HomeHero } from "@/sections/home-hero";
import { KitCallout } from "@/sections/kit-callout";
import { MaterialStandard } from "@/sections/material-standard";
import { ProductSpotlight } from "@/sections/product-spotlight";
import { RepairAndJournal } from "@/sections/repair-and-journal";

export const revalidate = 3600;

const FEATURED_HANDLES = [
  "weatherline-shell",
  "traverse-grid-fleece",
  "ridge-30-field-pack",
  "talus-trail-shoe",
] as const;

const CATEGORY_HANDLES = ["outerwear", "packs", "footwear"] as const;

export default async function HomePage() {
  const [themeContent, products, collections, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
    storefront.listArticles(),
  ]);
  const productsByHandle = new Map<string, Product>(
    products.map((product) => [product.handle, product]),
  );
  const collectionsByHandle = new Map<string, Collection>(
    collections.map((collection) => [collection.handle, collection]),
  );
  const featured = FEATURED_HANDLES.map((handle) =>
    productsByHandle.get(handle),
  ).filter((product): product is Product => product !== undefined);
  const categories = CATEGORY_HANDLES.map((handle) =>
    collectionsByHandle.get(handle),
  ).filter((collection): collection is Collection => collection !== undefined);
  /* Editorial copy here uses `subtitle` — the theme-owned one-sentence summary
   * keyed by canonical handle in `catalog-presentation.ts` — because the full
   * Shopify `description` is a product-page body, not a Home teaser. */
  const spotlight = productsByHandle.get("drift-insulated-vest") ?? featured[0];
  const pack = productsByHandle.get("approach-18-day-pack") ?? featured[1];
  const dispatch = articles[0];
  const spotlightImage = spotlight?.colorways[0]?.images.context;
  const kitProducts = featured.slice(0, 3).flatMap((product) => {
    const image = product.colorways[0]?.images.primary;
    return image === undefined ? [] : [{ product, image }];
  });

  return (
    <div className="bg-text-inverse">
      <HomeHero
        eyebrowLabel="Forward / Field equipment 2026"
        heading="Equipment for weather that changes the plan."
        lede="Layerable apparel, precise footwear, and low-profile carry systems made to move together."
        primaryCtaLabel="Shop all equipment"
        primaryCtaHref="/shop"
        secondaryCtaLabel="How we test"
        secondaryCtaHref="/field-testing"
        stats={[
          { label: "Systems", value: String(categories.length) },
          { label: "Core objects", value: String(products.length) },
          { label: "Repair", value: "For life" },
        ]}
        image={themeContent.homeHeroImage}
        featuredProduct={featured[0]}
      />

      <FeaturedProducts
        eyebrowLabel="New field rotation"
        heading="Start with the core four."
        body="A weather layer, breathable midlayer, close-body carry, and trail shoe form the shortest route to a complete Forward system."
        linkLabel={`Shop all ${products.length}`}
        linkHref="/shop"
        products={featured}
      />

      <CollectionIndex
        eyebrowLabel="Shop by system"
        heading="Built separately. Better together."
        collections={categories}
      />

      {spotlight !== undefined && spotlightImage !== undefined ? (
        <ProductSpotlight
          eyebrowPrefix="Layer focus /"
          ctaLabel="Explore the layer"
          specCount={3}
          product={spotlight}
          image={spotlightImage}
        />
      ) : null}

      <MaterialStandard
        eyebrowLabel="Material standard"
        heading="Fewer materials. Better understood."
        body="Every fabric, foam, buckle, and compound is selected around useful life, field repair, and performance you can actually feel."
        primaryCtaLabel="Explore materials"
        primaryCtaHref="/materials"
        secondaryCtaLabel="About Forward"
        secondaryCtaHref="/about"
        image={themeContent.standardBandImage}
      />

      {pack !== undefined ? (
        <KitCallout
          eyebrowLabel="One-day kit"
          heading="Carry the day, not the doubt."
          linkLabel={`View ${pack.title}`}
          product={pack}
          tiles={kitProducts}
        />
      ) : null}

      <RepairAndJournal
        repairEyebrowLabel="Repair, not replace"
        repairHeading="Keep equipment in motion."
        repairBody="Product defects are repaired free. Wear, accidents, and hard-earned damage are assessed honestly before work begins."
        repairLinkLabel="Visit the repair desk"
        repairLinkHref="/pages/field-repair"
        journalEyebrowLabel="Latest field note"
        journalLinkLabel="Read the dispatch"
        article={dispatch}
      />
    </div>
  );
}
