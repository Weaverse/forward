import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import EditorialCallout from "@/sections/editorial-callout";
import EditorialHero from "@/sections/editorial-hero";
import PrincipleGrid from "@/sections/principle-grid";
import ProductTiles from "@/sections/product-tiles";

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
      <EditorialHero
        eyebrowLabel="Custom page / Material library"
        heading="Performance begins with what a product is made from."
        lede="We use a short material vocabulary, document what each element is for, and design care around extending its useful life."
        image={theme.standardBandImage}
        imageSide="left"
      />
      <PrincipleGrid
        principles={[
          {
            number: "01",
            title: "Protect without excess",
            copy: "Shell fabrics and insulation are tuned around weather protection, movement, and packability—not maximum numbers in isolation.",
          },
          {
            number: "02",
            title: "Carry without distraction",
            copy: "Foams, webbing, and hardware are selected to stabilize a load while keeping adjustment and repair straightforward.",
          },
          {
            number: "03",
            title: "Grip with feedback",
            copy: "Footwear compounds balance traction, ground feel, and controlled wear across mixed trail and rock.",
          },
        ]}
      />
      <ProductTiles tiles={representatives} />
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
