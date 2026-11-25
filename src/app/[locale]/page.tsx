import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/json-ld";
import { marketAlternates } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { getStorefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: Pick<HomePageProps, "params">): Promise<Metadata> {
  const locale = parseLocale((await params).locale) ?? DEFAULT_LOCALE;
  return { alternates: marketAlternates("/", locale) };
}

/**
 * Home.
 *
 * Composed entirely from the project's `INDEX` template. Every section takes
 * its own data through its loader; the route reads only the shop's name, for
 * the Organization and WebSite structured data.
 */
export default async function HomePage(props: HomePageProps) {
  const locale = await routeLocale(props.params);
  const [page, projectId, shop] = await Promise.all([
    loadWeaversePage({
      locale,
      pathname: "/",
      searchParams: await props.searchParams,
      type: "INDEX",
    }),
    Promise.resolve(weaverseProjectId()),
    getStorefront(locale).getShop(),
  ]);

  if (page === null || projectId === null) {
    notFound();
  }

  return (
    <div className="-mt-header-compact [--header-inset:var(--spacing-header-compact)] bg-text-inverse md:-mt-header md:[--header-inset:var(--spacing-header)]">
      <JsonLdScript
        data={[
          organizationJsonLd(shop.name, locale),
          websiteJsonLd(shop.name, locale),
        ]}
      />
      <WeaversePage data={page} projectId={projectId} />
    </div>
  );
}
