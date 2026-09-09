import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { resolveProduct } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export type ProductSpotlightLoaderData = {
  product: Product;
  image: StorefrontImage;
} | null;

/**
 * Resolves the spotlit product and its context image.
 *
 * `null` when nothing is selected, the handle no longer resolves, or the
 * product has no context image — the section then renders a placeholder in
 * Studio and nothing on the storefront.
 */
export async function loader({
  data,
}: LoaderArgs): Promise<ProductSpotlightLoaderData> {
  const product = await resolveProduct(
    (data as { product?: unknown } | undefined)?.product,
  );
  if (product === null) return null;
  const image = product.colorways[0]?.images.context;
  return image === undefined ? null : { image, product };
}
