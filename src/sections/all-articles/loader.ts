import type { WeaverseNextComponent } from "@weaverse/next";
import { getStorefront } from "@/lib/storefront/data-source";
import type { JournalArticle } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface AllArticlesLoaderData {
  articles: readonly JournalArticle[];
}

/** Every article the store publishes, across all blogs, newest first. */
export async function loader({
  context,
}: LoaderArgs): Promise<AllArticlesLoaderData> {
  const locale = loaderLocale(context);
  return { articles: await getStorefront(locale).listArticles() };
}
