import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import { loadWeaversePage, weaverseProjectId } from "@/lib/weaverse/server";
import EditorialCallout from "@/sections/editorial-callout";
import EditorialHero from "@/sections/editorial-hero";
import PrincipleGrid from "@/sections/principle-grid";
import ProductTiles from "@/sections/product-tiles";

export const metadata: Metadata = {
  title: "Materials",
  description: "Forward material choices, care principles, and repair intent.",
};

const PRINCIPLES = [
  "01 | Protect without excess | Shell fabrics and insulation are tuned around weather protection, movement, and packability\u2014not maximum numbers in isolation.",
  "02 | Carry without distraction | Foams, webbing, and hardware are selected to stabilize a load while keeping adjustment and repair straightforward.",
  "03 | Grip with feedback | Footwear compounds balance traction, ground feel, and controlled wear across mixed trail and rock.",
].join("\n");

/**
 * Materials.
 *
 * Weaverse composes this route when the project has a page for it; otherwise
 * the same sections render from local defaults so the credential-free
 * storefront stays complete.
 */
export default async function MaterialsPage() {
  const [page, projectId] = await Promise.all([
    loadWeaversePage({ type: "PAGE", handle: "materials" }),
    Promise.resolve(weaverseProjectId()),
  ]);

  if (page !== null && projectId !== null) {
    return <WeaversePage data={page} projectId={projectId} />;
  }

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
      <EditorialHero
        eyebrowLabel="Custom page / Material library"
        heading="Performance begins with what a product is made from."
        lede="We use a short material vocabulary, document what each element is for, and design care around extending its useful life."
        image={theme.standardBandImage}
        imageSide="left"
      />
      <PrincipleGrid principles={PRINCIPLES} />
      <ProductTiles loaderData={{ tiles: representatives }} />
      <EditorialCallout
        eyebrowLabel="Care + repair"
        heading="Maintenance is part of performance."
        body="Clean only when needed, restore water repellency before replacing a shell, and send structural damage to the repair desk."
        ctaLabel="Repair programme"
        ctaHref="/pages/field-repair"
      />
    </div>
  );
}
