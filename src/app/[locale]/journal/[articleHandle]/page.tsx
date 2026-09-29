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

interface ArticlePageProps {
  params: Promise<{ locale: string; articleHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = parseLocale(params.locale) ?? DEFAULT_LOCALE;
  const articles = await getStorefront(locale).listArticles();
  return articles.map((article) => ({ articleHandle: article.handle }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale: segment, articleHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const article = await getStorefront(locale).getArticle(articleHandle);
  if (article === null) {
    return { title: "Article not found" };
  }
  return { title: `${article.title} · Journal`, description: article.excerpt };
}

/**
 * Journal article.
 *
 * `ARTICLE` composes the chrome around content written in Shopify: the body
 * blocks are rendered verbatim, and the article itself reaches the sections
 * through the shared data context because the route picks it, not a merchant.
 */
export default async function ArticlePage(props: ArticlePageProps) {
  const { articleHandle } = await props.params;
  const locale = await routeLocale(props.params);
  const [article, page, projectId] = await Promise.all([
    getStorefront(locale).getArticle(articleHandle),
    loadWeaversePage({
      locale,
      handle: articleHandle,
      pathname: `/journal/${articleHandle}`,
      searchParams: await props.searchParams,
      type: "ARTICLE",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (article === null || page === null || projectId === null) {
    notFound();
  }

  return (
    <WeaversePage data={page} dataContext={{ article }} projectId={projectId} />
  );
}
