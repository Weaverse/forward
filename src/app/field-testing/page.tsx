import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import { EditorialCallout } from "@/sections/editorial-callout";
import { EditorialOverlayHero } from "@/sections/editorial-overlay-hero";
import { NumberedSequence } from "@/sections/numbered-sequence";
import { ProductCaseStudy } from "@/sections/product-case-study";

export const metadata: Metadata = {
  title: "Field Testing",
  description: "How Forward evaluates products before they enter the catalog.",
};

export default async function FieldTestingCustomPage() {
  const [theme, products, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listArticles(),
  ]);
  const shell = products.find(
    (product) => product.handle === "weatherline-shell",
  );
  const shellImage = shell?.colorways[0]?.images.context;
  const testingArticle = articles.find(
    (article) =>
      article.handle === "how-we-test-a-shell-before-calling-it-weatherproof",
  );
  return (
    <div>
      <EditorialOverlayHero
        eyebrowLabel="Custom page / Field testing"
        heading="Test the system, not the claim."
        lede="Wind, rain, abrasion, repeated packing, and long movement reveal more than an isolated specification ever will."
        image={theme.homeHeroImage}
      />
      <NumberedSequence
        eyebrowLabel="The sequence"
        heading="From controlled checks to useful failure."
        steps={[
          {
            number: "01",
            title: "Baseline",
            copy: "Confirm construction, fit, range of movement, and every functional detail before field use.",
          },
          {
            number: "02",
            title: "Exposure",
            copy: "Use the product through realistic weather and terrain in combination with the complete system.",
          },
          {
            number: "03",
            title: "Repetition",
            copy: "Pack, wash, adjust, and wear repeatedly to surface friction, fatigue, and awkward interactions.",
          },
          {
            number: "04",
            title: "Repair review",
            copy: "Evaluate how failure can be diagnosed and repaired before a product earns a permanent place.",
          },
        ]}
      />
      {shell !== undefined && shellImage !== undefined ? (
        <ProductCaseStudy
          eyebrowLabel="Case study / Weatherline"
          ctaLabel="View the shell"
          product={shell}
          image={shellImage}
        />
      ) : null}
      {testingArticle !== undefined ? (
        <EditorialCallout
          eyebrowLabel="Field note"
          heading="Read the complete shell protocol."
          body={testingArticle.excerpt}
          ctaLabel="Open field note"
          ctaHref={`/journal/${testingArticle.handle}`}
        />
      ) : null}
    </div>
  );
}
