import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";

import { getStorefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface StorePageProps {
  params: Promise<{ locale: string; pageHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = parseLocale(params.locale) ?? DEFAULT_LOCALE;
  const pages = await getStorefront(locale).listPages();
  return pages.map((page) => ({ pageHandle: page.handle }));
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { locale: segment, pageHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const page = await getStorefront(locale).getPage(pageHandle);
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
  const locale = await routeLocale(props.params);
  const [page, weaversePage, projectId] = await Promise.all([
    getStorefront(locale).getPage(pageHandle),
    loadWeaversePage({
      locale,
      handle: pageHandle,
      pathname: `/pages/${pageHandle}`,
      searchParams: await props.searchParams,
      type: "PAGE",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (page === null || weaversePage === null || projectId === null) {
    notFound();
  }

  return (
    <WeaversePage
      data={weaversePage}
      dataContext={{ page }}
      projectId={projectId}
    />
  );
}
