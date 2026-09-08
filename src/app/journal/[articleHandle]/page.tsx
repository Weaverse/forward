import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { ArticleBody } from "@/sections/article-body";
import { ArticleHeader } from "@/sections/article-header";

interface ArticlePageProps {
  params: Promise<{ articleHandle: string }>;
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
  if (article === null) {
    notFound();
  }

  return (
    <>
      <ArticleHeader
        breadcrumbLabel="Journal"
        breadcrumbHref="/journal"
        article={article}
      />

      <ArticleBody
        backLinkLabel="All field notes"
        backLinkHref="/journal"
        article={article}
      />
    </>
  );
}
