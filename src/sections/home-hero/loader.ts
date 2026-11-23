import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";

import type { Product } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveProduct } from "@/lib/weaverse/resource";

export interface HomeHeroLoaderData {
  featuredProduct: Product | null;
}

/** Resolves the optional product badge shown over the hero image. */
export async function loader({
  data,
  context,
}: WeaverseNextComponentLoaderArgs): Promise<HomeHeroLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { featuredProduct?: unknown } | undefined)
    ?.featuredProduct;
  return { featuredProduct: await resolveProduct(selection, locale) };
}
