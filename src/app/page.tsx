import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import CollectionIndex from "@/sections/collection-index";
import FeaturedProducts from "@/sections/featured-products";
import HomeHero from "@/sections/home-hero";
import KitCallout from "@/sections/kit-callout";
import MaterialStandard from "@/sections/material-standard";
import ProductSpotlight from "@/sections/product-spotlight";
import RepairAndJournal from "@/sections/repair-and-journal";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export const revalidate = 3600;

const FEATURED_HANDLES = [
  "weatherline-shell",
  "traverse-grid-fleece",
  "ridge-30-field-pack",
  "talus-trail-shoe",
] as const;

const CATEGORY_HANDLES = ["outerwear", "packs", "footwear"] as const;

/**
 * Home.
 *
 * Composed from Weaverse when the project has an `INDEX` page, and rendered
 * from the theme's own defaults when it does not.
 *
 * The three editorial routes were allowed to disappear without Weaverse
 * because Studio owns their content outright. Home is different: the route
 * contract requires `/` to answer 200, and a storefront whose home page
 * depends on an external service is not the credential-free storefront this
 * theme is verified against. So this one keeps its fallback.
 */
export default async function HomePage(props: HomePageProps) {
  const [page, projectId, products, collections, articles, theme] =
    await Promise.all([
      loadWeaversePage({
        pathname: "/",
        searchParams: await props.searchParams,
        type: "INDEX",
      }),
      Promise.resolve(weaverseProjectId()),
      storefront.listProducts(),
      storefront.listCollections(),
      storefront.listArticles(),
      storefront.getThemeContent(),
    ]);

  if (page !== null && projectId !== null) {
    return (
      <div className="bg-text-inverse">
        <WeaversePage
          data={page}
          dataContext={{ articles, collections, products, theme }}
          projectId={projectId}
        />
      </div>
    );
  }

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
  const spotlight = productsByHandle.get("drift-insulated-vest") ?? featured[0];
  const spotlightImage = spotlight?.colorways[0]?.images.context;
  const pack = productsByHandle.get("approach-18-day-pack") ?? featured[1];
  const kitTiles = featured.slice(0, 3).flatMap((product) => {
    const image = product.colorways[0]?.images.primary;
    return image === undefined ? [] : [{ image, product }];
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
          `${categories.length} | Systems`,
          `${products.length} | Core objects`,
          "For life | Repair",
        ].join("\n")}
        image={theme.homeHeroImage}
        loaderData={{ featuredProduct: featured[0] ?? null }}
      />

      <FeaturedProducts
        eyebrowLabel="New field rotation"
        heading="Start with the core four."
        body="A weather layer, breathable midlayer, close-body carry, and trail shoe form the shortest route to a complete Forward system."
        linkLabel={`Shop all ${products.length}`}
        linkHref="/shop"
        loaderData={{ products: featured }}
      />

      <CollectionIndex
        eyebrowLabel="Shop by system"
        heading="Built separately. Better together."
        loaderData={{ collections: categories }}
      />

      {spotlight !== undefined && spotlightImage !== undefined ? (
        <ProductSpotlight
          eyebrowPrefix="Layer focus /"
          ctaLabel="Explore the layer"
          specCount={3}
          loaderData={{ image: spotlightImage, product: spotlight }}
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
        image={theme.standardBandImage}
      />

      <KitCallout
        eyebrowLabel="One-day kit"
        heading="Carry the day, not the doubt."
        linkLabel={pack === undefined ? "View the kit" : `View ${pack.title}`}
        loaderData={{ product: pack ?? null, tiles: kitTiles }}
      />

      <RepairAndJournal
        repairEyebrowLabel="Repair, not replace"
        repairHeading="Keep equipment in motion."
        repairBody="Product defects are repaired free. Wear, accidents, and hard-earned damage are assessed honestly before work begins."
        repairLinkLabel="Visit the repair desk"
        repairLinkHref="/pages/field-repair"
        journalEyebrowLabel="Latest field note"
        journalLinkLabel="Read the dispatch"
        loaderData={{ article: articles[0] ?? null }}
      />
    </div>
  );
}
