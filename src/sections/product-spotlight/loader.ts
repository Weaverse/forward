import type { WeaverseNextComponentLoaderArgs } from "@weaverse/hydrogen/next";

import type { Product } from "@/lib/storefront/types";
import { loaderLocale } from "@/lib/weaverse/request-info";
import { resolveProduct } from "@/lib/weaverse/resource";

export type ProductSpotlightLoaderData = { product: Product } | null;

/**
 * Resolves the spotlit product.
 *
 * `null` only when nothing is selected or the handle no longer resolves; the
 * section then renders its placeholder. Images come from the selected
 * colorway in the component, so a product without a context image still
 * renders.
 */
export async function loader({
  data,
  context,
}: WeaverseNextComponentLoaderArgs): Promise<ProductSpotlightLoaderData> {
  const locale = loaderLocale(context);
  const product = await resolveProduct(
    (data as { product?: unknown } | undefined)?.product,
    locale,
  );
  return product === null ? null : { product };
}
