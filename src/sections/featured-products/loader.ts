import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product } from "@/lib/storefront/types";
import { loaderLocale, resolveProducts } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface FeaturedProductsLoaderData {
  products: readonly Product[];
}

export async function loader({
  data,
  context,
}: LoaderArgs): Promise<FeaturedProductsLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { products?: unknown } | undefined)?.products;
  return { products: await resolveProducts(selection, locale) };
}
