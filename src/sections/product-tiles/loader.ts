import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { resolveProducts } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface ProductTilesLoaderData {
  tiles: readonly { product: Product; image: StorefrontImage }[];
}

/**
 * Resolves the selected products and pairs each with its detail image.
 *
 * A product whose first colorway has no detail image is dropped rather than
 * rendered as an empty tile, which matches how the route built these pairs
 * before the section was composable.
 */
export async function loader({
  data,
}: LoaderArgs): Promise<ProductTilesLoaderData> {
  const selection = (data as { products?: unknown } | undefined)?.products;
  const products = await resolveProducts(selection);

  return {
    tiles: products.flatMap((product) => {
      const image = product.colorways[0]?.images.detail;
      return image === undefined ? [] : [{ product, image }];
    }),
  };
}
