import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";

import type { Collection } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveCollections } from "@/lib/weaverse/resource";

export interface CollectionIndexLoaderData {
  collections: readonly Collection[];
}

export async function loader({
  data,
  context,
}: WeaverseNextComponentLoaderArgs): Promise<CollectionIndexLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { collections?: unknown } | undefined)
    ?.collections;
  return { collections: await resolveCollections(selection, locale) };
}
