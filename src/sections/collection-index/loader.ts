import type { WeaverseNextComponent } from "@weaverse/next";

import type { Collection } from "@/lib/storefront/types";
import { resolveCollections } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface CollectionIndexLoaderData {
  collections: readonly Collection[];
}

export async function loader({
  data,
}: LoaderArgs): Promise<CollectionIndexLoaderData> {
  const selection = (data as { collections?: unknown } | undefined)
    ?.collections;
  return { collections: await resolveCollections(selection) };
}
