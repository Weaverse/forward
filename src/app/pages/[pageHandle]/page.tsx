import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { PageHero } from "@/sections/page-hero";
import { PageOrigin } from "@/sections/page-origin";
import { PagePremise } from "@/sections/page-premise";
import { PageValues } from "@/sections/page-values";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await storefront.listPages();
  return pages.map((page) => ({ pageHandle: page.handle }));
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { pageHandle } = await params;
  const page = await storefront.getPage(pageHandle);
  if (page === null) {
    return { title: "Page not found" };
  }
  return { title: page.title, description: page.intro };
}

/** Rich-content surface shared by normalized Shopify pages. */
export default async function StorePageRoute({ params }: StorePageProps) {
  const { pageHandle } = await params;
  const [page, themeContent, collections] = await Promise.all([
    storefront.getPage(pageHandle),
    storefront.getThemeContent(),
    storefront.listCollections(),
  ]);
  if (page === null) {
    notFound();
  }
  const heroImage = page.heroImage ?? themeContent.standardBandImage;
  const originImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;
  const [premise, ...values] = page.sections;

  return (
    <>
      <PageHero
        eyebrowLabel={page.eyebrow}
        heading={page.title}
        image={heroImage}
      />

      <PagePremise
        eyebrowLabel="Our premise"
        intro={page.intro}
        premise={premise}
      />

      {values.length > 0 ? (
        <PageValues eyebrowSuffix="Field standard" sections={values} />
      ) : null}

      <PageOrigin
        eyebrowLabel="Where this goes"
        heading={
          <>
            A short catalog,
            <br />
            built slowly.
          </>
        }
        body={themeContent.footerTagline}
        linkLabel="Shop the catalog"
        linkHref="/shop"
        image={originImage}
      />
    </>
  );
}
