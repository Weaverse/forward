import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";
import { getStorefront } from "@/lib/storefront/data-source";
import type { JournalArticle } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";

export interface AllArticlesLoaderData {
  articles: readonly JournalArticle[];
}

/** Every article the store publishes, across all blogs, newest first. */
export async function loader({
  context,
}: WeaverseNextComponentLoaderArgs): Promise<AllArticlesLoaderData> {
  const locale = loaderLocale(context);
  return { articles: await getStorefront(locale).listArticles() };
}
