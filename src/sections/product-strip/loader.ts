import type { WeaverseNextComponent } from "@weaverse/next";

import { resolveProducts } from "@/lib/weaverse/resource";

type LoaderArgs = Parameters<NonNullable<WeaverseNextComponent["loader"]>>[0];

export interface ProductStripLoaderData {
  products: Awaited<ReturnType<typeof resolveProducts>>;
}

/**
 * Resolves the merchant's product selection through the storefront data
 * source. The picker stores only `{ id, handle }`, so this is where those
 * handles become the normalized products the section renders.
 *
 * Server-only, and deliberately not re-exported from `index.tsx`: that file is
 * a Client Component, and re-exporting would pull the data source into the
 * browser bundle.
 */
export async function loader({
  data,
}: LoaderArgs): Promise<ProductStripLoaderData> {
  const selection = (data as { products?: unknown } | undefined)?.products;
  return { products: await resolveProducts(selection) };
}
