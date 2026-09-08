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
import ArticleBody from "@/sections/article-body";
import ArticleHeader from "@/sections/article-header";

interface ArticlePageProps {
  params: Promise<{ articleHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await storefront.listArticles();
  return articles.map((article) => ({ articleHandle: article.handle }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
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
  const [article, page, projectId] = await Promise.all([
    storefront.getArticle(articleHandle),
    loadWeaversePage({
      handle: articleHandle,
      pathname: `/journal/${articleHandle}`,
      searchParams: await props.searchParams,
      type: "ARTICLE",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (article === null) {
    notFound();
  }

  if (page !== null && projectId !== null) {
    return (
      <WeaversePage
        data={page}
        dataContext={{ article }}
        projectId={projectId}
      />
    );
  }

  return (
    <StorefrontDataProvider value={{ article }}>
      <ArticleHeader breadcrumbLabel="Journal" breadcrumbHref="/journal" />

      <ArticleBody backLinkLabel="All field notes" backLinkHref="/journal" />
    </StorefrontDataProvider>
  );
}
