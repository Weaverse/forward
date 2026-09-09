import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { resolveProduct, resolveProducts } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface KitCalloutLoaderData {
  product: Product | null;
  tiles: readonly { product: Product; image: StorefrontImage }[];
}

/** Resolves the featured kit product and the tile products beside it. */
export async function loader({
  data,
}: LoaderArgs): Promise<KitCalloutLoaderData> {
  const settings = data as
    | { product?: unknown; tileProducts?: unknown }
    | undefined;
  const [product, tileProducts] = await Promise.all([
    resolveProduct(settings?.product),
    resolveProducts(settings?.tileProducts),
  ]);

  return {
    product,
    tiles: tileProducts.flatMap((entry) => {
      const image = entry.colorways[0]?.images.primary;
      return image === undefined ? [] : [{ image, product: entry }];
    }),
  };
}
