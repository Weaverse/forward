import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";

import type { Product } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveProduct } from "@/lib/weaverse/resource";

export interface HeroSlideLoaderData {
  featuredProduct: Product | null;
}

/** Resolves the slide's optional featured product badge. */
export async function loader({
  data,
  context,
}: WeaverseNextComponentLoaderArgs): Promise<HeroSlideLoaderData> {
  const locale = loaderLocale(context);
  const selection = (data as { featuredProduct?: unknown } | undefined)
    ?.featuredProduct;
  return { featuredProduct: await resolveProduct(selection, locale) };
}
