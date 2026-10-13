import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeLocale } from "@/lib/i18n/route-locale";
import { translatedMetadata } from "@/lib/i18n/translator";
import { getStorefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export function generateMetadata({
  params,
}: Pick<CategoriesPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "meta.categoriesTitle",
    description: "meta.categoriesDescription",
    path: "/categories",
  });
}

/**
 * The collection list.
 *
 * Only the URL says "categories": a Forward category is a product's
 * `productType`, so this page is Weaverse's `COLLECTION_LIST` and lists the
 * store's collections, which reach the sections through the data context.
 */
export default async function CategoriesPage(props: CategoriesPageProps) {
  const locale = await routeLocale(props.params);
  const [collections, page, projectId] = await Promise.all([
    getStorefront(locale).listCollections(),
    loadWeaversePage({
      locale,
      pathname: "/categories",
      searchParams: await props.searchParams,
      type: "COLLECTION_LIST",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (page === null || projectId === null) {
    notFound();
  }

  return (
    <WeaversePage
      data={page}
      dataContext={{ collections }}
      projectId={projectId}
    />
  );
}
