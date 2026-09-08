import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import { loadWeaversePage, weaverseProjectId } from "@/lib/weaverse/server";
import EditorialCallout from "@/sections/editorial-callout";
import EditorialOverlayHero from "@/sections/editorial-overlay-hero";
import NumberedSequence from "@/sections/numbered-sequence";
import ProductCaseStudy from "@/sections/product-case-study";

export const metadata: Metadata = {
  title: "Field Testing",
  description: "How Forward evaluates products before they enter the catalog.",
};

const SEQUENCE_STEPS = [
  "01 | Baseline | Confirm construction, fit, range of movement, and every functional detail before field use.",
  "02 | Exposure | Use the product through realistic weather and terrain in combination with the complete system.",
  "03 | Repetition | Pack, wash, adjust, and wear repeatedly to surface friction, fatigue, and awkward interactions.",
  "04 | Repair review | Evaluate how failure can be diagnosed and repaired before a product earns a permanent place.",
].join("\n");

/**
 * Field testing.
 *
 * Weaverse composes this route when the project has a page for it. Without
 * that — no credentials, nothing published yet, or a failed fetch — the route
 * renders the same sections from local defaults, so the credential-free
 * storefront stays complete. The sections take one prop shape either way;
 * only who fills it changes.
 */
export default async function FieldTestingPage() {
  const [page, projectId] = await Promise.all([
    loadWeaversePage({
      handle: "field-testing",
      pathname: "/field-testing",
      type: "CUSTOM",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);

  if (page !== null && projectId !== null) {
    return <WeaversePage data={page} projectId={projectId} />;
  }

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
        steps={SEQUENCE_STEPS}
      />
      {shell !== undefined && shellImage !== undefined ? (
        <ProductCaseStudy
          eyebrowLabel="Case study / Weatherline"
          ctaLabel="View the shell"
          loaderData={{ image: shellImage, product: shell }}
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
