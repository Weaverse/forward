import type { Metadata } from "next";
import { JsonLdScript } from "@/components/json-ld";
import { marketAlternates } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, type LocaleId, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator } from "@/lib/i18n/translator";
import { shopifyRedirectOrNotFound } from "@/lib/routes/not-found";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/lib/seo/structured-data";
import { getStorefront } from "@/lib/storefront/data-source";
import type { Product } from "@/lib/storefront/types";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface ProductPageProps {
  params: Promise<{ locale: string; productHandle: string }>;
  searchParams: Promise<SearchParams>;
}

/*
 * Bounded catalog freshness. Must stay equal to `CATALOG_REVALIDATE_SECONDS`
 * (`src/lib/storefront/shopify/data-source.ts`); the literal is inlined because
 * Next requires a statically analyzable segment value, and a unit test asserts
 * the two never drift. The route stays static — no request-time API is called.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale: segment, productHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const product = await getStorefront(locale).getProduct(productHandle);
  if (product === null) {
    const t = await getTranslator(locale);
    return { title: t("meta.productNotFound") };
  }
  const image = product.colorways[0]?.images.primary;
  return {
    title: product.title,
    description: product.subtitle,
    alternates: marketAlternates(`/products/${productHandle}`, locale),
    openGraph: {
      /* Next's OpenGraph types have no `product`; `website` is the ogp.me
       * type Next can render for it. */
      type: "website",
      url: absoluteUrl(`/products/${product.handle}`, locale),
      title: product.title,
      description: product.subtitle,
      ...(image === undefined
        ? {}
        : {
            images: [
              {
                url: image.src,
                width: image.width,
                height: image.height,
                alt: image.alt,
              },
            ],
          }),
    },
  };
}

async function relatedProducts(product: Product, locale: LocaleId) {
  const related = await Promise.all(
    product.relatedHandles.map((handle) =>
      getStorefront(locale).getProduct(handle),
    ),
  );
  return related.filter((entry): entry is Product => entry !== null);
}

export default async function ProductPage(props: ProductPageProps) {
  const { productHandle } = await props.params;
  const locale = await routeLocale(props.params);
  const [product, page, projectId] = await Promise.all([
    getStorefront(locale).getProduct(productHandle),
    loadWeaversePage({
      locale,
      handle: productHandle,
      pathname: `/products/${productHandle}`,
      searchParams: await props.searchParams,
      type: "PRODUCT",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (product === null || page === null || projectId === null) {
    return shopifyRedirectOrNotFound();
  }
  const [related, t] = await Promise.all([
    relatedProducts(product, locale),
    getTranslator(locale),
  ]);

  return (
    <>
      <JsonLdScript
        data={[
          productJsonLd(product, locale),
          breadcrumbJsonLd(
            [
              [t("meta.breadcrumbHome"), "/"],
              [t("meta.shopTitle"), "/shop"],
              [product.title, `/products/${product.handle}`],
            ],
            locale,
          ),
        ]}
      />
      <WeaversePage
        data={page}
        dataContext={{ product, products: related }}
        projectId={projectId}
      />
    </>
  );
}
