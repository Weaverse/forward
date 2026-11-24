/**
 * schema.org JSON-LD for the pages search engines index as commerce:
 * products (with their offers), breadcrumb trails, and the site itself.
 * Every URL is absolute, built from the public origin.
 */

import { type LocaleId, localizePath } from "@/lib/i18n/locales";
import { siteBaseUrl } from "@/lib/routes/site";
import {
  galleryImages,
  productSelectionHref,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

export type JsonLd = Record<string, unknown>;

/** The absolute URL of a theme path in a market. */
export function absoluteUrl(path: string, locale: LocaleId): string {
  return `${siteBaseUrl()}${localizePath(path, locale)}`;
}

/**
 * A product and one offer per variant. Each offer links to the URL that
 * selects that variant, so a crawler lands on the exact price it read.
 */
export function productJsonLd(product: Product, locale: LocaleId): JsonLd {
  const images = product.colorways.flatMap((colorway) =>
    galleryImages(colorway).map((image) => image.src),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url: absoluteUrl(`/products/${product.handle}`, locale),
    image: [...new Set(images)],
    ...(product.category === "" ? {} : { category: product.category }),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: variant.price.amount.toFixed(2),
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(
        productSelectionHref(
          product,
          variant.colorwayId,
          Object.fromEntries(
            variant.selectedOptions.map(({ name, value }) => [name, value]),
          ),
        ),
        locale,
      ),
    })),
  };
}

/** A breadcrumb trail of `[name, path]` steps, home first. */
export function breadcrumbJsonLd(
  steps: readonly (readonly [name: string, path: string])[],
  locale: LocaleId,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: steps.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path, locale),
    })),
  };
}

/** The site, with the search box search engines can show for it. */
export function websiteJsonLd(name: string, locale: LocaleId): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: absoluteUrl("/", locale),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search", locale)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * JSON for an inline `<script>`: `<` is escaped so store text such as
 * `</script>` in a description cannot close the tag.
 */
export function serializeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
