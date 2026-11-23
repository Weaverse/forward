import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";

import type { Product } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveProducts } from "@/lib/weaverse/resource";

export interface FeaturedProductsLoaderData {
  products: readonly Product[];
}

export async function loader({
  data,
  context,
}: WeaverseNextComponentLoaderArgs): Promise<FeaturedProductsLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { products?: unknown } | undefined)?.products;
  return { products: await resolveProducts(selection, locale) };
}
