import type { WeaverseNextComponent } from "@weaverse/next";

import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { resolveProduct } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export type ProductCaseStudyLoaderData = {
  product: Product;
  image: StorefrontImage;
} | null;

/**
 * Resolves the selected product and its context image.
 *
 * Returns `null` when nothing is selected, when the handle no longer resolves,
 * or when the product has no usable image — the section renders nothing in all
 * three cases rather than a case study with a missing subject.
 */
export async function loader({
  data,
}: LoaderArgs): Promise<ProductCaseStudyLoaderData> {
  const selection = (data as { product?: unknown } | undefined)?.product;
  const product = await resolveProduct(selection);
  if (product === null) {
    return null;
  }

  const image = product.colorways[0]?.images.context;
  return image === undefined ? null : { image, product };
}
