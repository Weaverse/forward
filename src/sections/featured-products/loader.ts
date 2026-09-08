import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product } from "@/lib/storefront/types";
import { resolveProducts } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface FeaturedProductsLoaderData {
  products: readonly Product[];
}

export async function loader({
  data,
}: LoaderArgs): Promise<FeaturedProductsLoaderData> {
  const selection = (data as { products?: unknown } | undefined)?.products;
  return { products: await resolveProducts(selection) };
}
