import type { Metadata } from "next";
import { storefront } from "@/lib/storefront/data-source";
import { EditorialHero } from "@/sections/editorial-hero";
import { ProductStrip } from "@/sections/product-strip";
import { StandardStatement } from "@/sections/standard-statement";
import { StatBand } from "@/sections/stat-band";

export const metadata: Metadata = {
  title: "About Forward",
  description: "The product principles and field standard behind Forward.",
};

export default async function AboutCustomPage() {
  const [theme, products, collections] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
  ]);
  return (
    <div>
      <EditorialHero
        eyebrowLabel="Custom page / About Forward"
        heading="Make less equipment. Make every piece matter."
        lede="Forward is built around complete movement systems rather than seasonal noise: fewer products, clearer jobs, longer useful lives."
        image={theme.homeHeroImage}
      />
      <StandardStatement
        eyebrowLabel="The Forward standard"
        statement="Useful over novel. Repairable over disposable. Quiet over loud."
        columns={[
          "We begin with the work a product must do, then remove anything that does not improve movement, protection, carry, or recovery.",
          "Materials are selected for known performance and honest aging. A worn product should carry evidence of use\u2014not become obsolete.",
          "Every core object belongs to a system, so layers and equipment earn their place together instead of competing for attention.",
        ]}
      />
      <StatBand
        stats={[
          { value: String(products.length), label: "core objects" },
          { value: String(collections.length - 1), label: "movement systems" },
          { value: "01", label: "repair commitment" },
        ]}
      />
      <ProductStrip
        eyebrowLabel="Representative equipment"
        heading="The standard, made physical."
        linkLabel="Complete catalog"
        linkHref="/shop"
        products={products.slice(0, 3)}
      />
    </div>
  );
}
