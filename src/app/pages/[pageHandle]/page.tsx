import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { StorefrontDataProvider } from "@/lib/weaverse/data-context";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import PageHero from "@/sections/page-hero";
import PageOrigin from "@/sections/page-origin";
import PagePremise from "@/sections/page-premise";
import PageValues from "@/sections/page-values";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
  searchParams: Promise<SearchParams>;
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

/**
 * Shopify page.
 *
 * `PAGE` is composable chrome around body content the merchant edits in
 * Shopify: the hero title, the premise copy, and the value cards all come from
 * the page resource, which reaches the sections through the shared data
 * context. Studio owns the surrounding layout and labels.
 */
export default async function StorePageRoute(props: StorePageProps) {
  const { pageHandle } = await props.params;
  const [page, themeContent, collections, weaversePage, projectId] =
    await Promise.all([
      storefront.getPage(pageHandle),
      storefront.getThemeContent(),
      storefront.listCollections(),
      loadWeaversePage({
        handle: pageHandle,
        pathname: `/pages/${pageHandle}`,
        searchParams: await props.searchParams,
        type: "PAGE",
      }),
      Promise.resolve(weaverseProjectId()),
    ]);
  if (page === null) {
    notFound();
  }
  const heroImage = page.heroImage ?? themeContent.standardBandImage;
  const originImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;

  if (weaversePage !== null && projectId !== null) {
    return (
      <WeaversePage
        data={weaversePage}
        dataContext={{ page }}
        projectId={projectId}
      />
    );
  }

  return (
    <StorefrontDataProvider value={{ page }}>
      <PageHero eyebrowLabel={page.eyebrow} image={heroImage} />

      <PagePremise eyebrowLabel="Our premise" />

      <PageValues eyebrowSuffix="Field standard" />

      <PageOrigin
        eyebrowLabel="Where this goes"
        heading={"A short catalog,\nbuilt slowly."}
        body={themeContent.footerTagline}
        linkLabel="Shop the catalog"
        linkHref="/shop"
        image={originImage}
      />
    </StorefrontDataProvider>
  );
}
