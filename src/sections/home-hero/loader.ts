import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product } from "@/lib/storefront/types";
import { resolveProduct } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface HomeHeroLoaderData {
  featuredProduct: Product | null;
}

/** Resolves the optional product badge shown over the hero image. */
export async function loader({
  data,
}: LoaderArgs): Promise<HomeHeroLoaderData> {
  const selection = (data as { featuredProduct?: unknown } | undefined)
    ?.featuredProduct;
  return { featuredProduct: await resolveProduct(selection) };
}
