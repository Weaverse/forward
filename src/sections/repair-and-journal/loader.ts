import type { WeaverseNextComponent } from "@weaverse/next";
import { getStorefront } from "@/lib/storefront/data-source";
import type { JournalArticle } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface RepairAndJournalLoaderData {
  article: JournalArticle | null;
}

/**
 * Resolves the dispatch shown beside the repair card.
 *
 * The section always shows the most recent article rather than a chosen one:
 * "latest field note" is the editorial promise, and pinning a specific article
 * would quietly turn it into a stale one. The blog picker in the schema names
 * which blog to read, not which post.
 */
export async function loader({
  context,
}: LoaderArgs): Promise<RepairAndJournalLoaderData> {
  const locale = loaderLocale(context);
  const articles = await getStorefront(locale).listArticles();
  return { article: articles[0] ?? null };
}
