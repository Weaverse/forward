import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import type { Product } from "@/lib/storefront/types";
import { StorefrontDataProvider } from "@/lib/weaverse/data-context";
import { WeaversePage } from "@/lib/weaverse/page";
import { pageRenders } from "@/lib/weaverse/page-payload";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import MainProduct from "@/sections/main-product";

interface ProductPageProps {
  params: Promise<{ productHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

/*
 * Bounded catalog freshness. Must stay equal to `CATALOG_REVALIDATE_SECONDS`
 * (`src/lib/storefront/shopify/data-source.ts`); the literal is inlined because
 * Next requires a statically analyzable segment value, and a unit test asserts
 * the two never drift. The route stays static — no request-time API is called.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await storefront.listProducts();
  return products.map((product) => ({ productHandle: product.handle }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productHandle } = await params;
  const product = await storefront.getProduct(productHandle);
  if (product === null) {
    return { title: "Product not found" };
  }
  return { title: product.title, description: product.subtitle };
}

async function relatedProducts(product: Product) {
  const related = await Promise.all(
    product.relatedHandles.map((handle) => storefront.getProduct(handle)),
  );
  return related.filter((entry): entry is Product => entry !== null);
}

export default async function ProductPage(props: ProductPageProps) {
  const { productHandle } = await props.params;
  const [product, page, projectId] = await Promise.all([
    storefront.getProduct(productHandle),
    loadWeaversePage({
      handle: productHandle,
      pathname: `/products/${productHandle}`,
      searchParams: await props.searchParams,
      type: "PRODUCT",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (product === null || page === null || projectId === null) {
    notFound();
  }
  const related = await relatedProducts(product);

  return (
    <>
      {/* The buy block is the one surface a product URL cannot be without. It
       * is a section so Studio can place things around it, but a template that
       * has not been seeded — or one a merchant removed it from — must not
       * leave a product page with no gallery, no variant selection and no way
       * to add to cart. So the route renders it when the page does not. */}
      {pageRenders(page, "main-product") ? null : (
        <StorefrontDataProvider value={{ product }}>
          <MainProduct />
        </StorefrontDataProvider>
      )}
      <WeaversePage
        data={page}
        dataContext={{ product, products: related }}
        projectId={projectId}
      />
    </>
  );
}
