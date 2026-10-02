import type { WeaverseNextComponent } from "@weaverse/next";

import type { Collection } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveCollections } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface CollectionIndexLoaderData {
  collections: readonly Collection[];
}

export async function loader({
  data,
  context,
}: LoaderArgs): Promise<CollectionIndexLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { collections?: unknown } | undefined)
    ?.collections;
  return { collections: await resolveCollections(selection, locale) };
}
