/**
 * Allowed sources for normalized product imagery.
 *
 * Static mode serves the approved branded catalog from `public/images/products/`.
 * Shopify mode serves owned product media from the store's Shopify CDN. These
 * are the only two shapes any normalized `StorefrontImage.src` may take, and
 * the same allowlist backs the Next Image remote pattern in `next.config.ts`
 * and the demo-cart storage validator.
 *
 * This module has no dependencies on purpose: it is imported by the Next config,
 * by server-only Shopify mapping code, and by browser demo-cart code.
 */

/** The exact Shopify CDN hostname that serves this store's owned media. */
export const SHOPIFY_IMAGE_HOSTNAME = "cdn.shopify.com";

/** Exact public CDN tenant path for the owned Forward Shopify store files. */
export const SHOPIFY_IMAGE_PATH_PREFIX = "/s/files/1/0978/4757/4828/files/";

const LOCAL_PRODUCT_IMAGE_PATTERN = /^\/images\/products\/[a-z0-9-]+\.webp$/;

/** True for an owned Shopify CDN media URL (https, exact host, files path). */
export function isShopifyProductImageUrl(src: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return false;
  }
  // Reject nested percent encoding before decoding once. Otherwise `%252e%252e`
  // can survive this validation as `%2e%2e` and be decoded again by an
  // intermediary/CDN into a traversal segment.
  if (/%25/i.test(parsed.pathname)) {
    return false;
  }
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(parsed.pathname);
  } catch {
    return false;
  }
  const decodedSegments = decodedPathname.split("/");
  return (
    parsed.protocol === "https:" &&
    parsed.hostname === SHOPIFY_IMAGE_HOSTNAME &&
    parsed.port === "" &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.pathname.startsWith(SHOPIFY_IMAGE_PATH_PREFIX) &&
    decodedPathname.startsWith(SHOPIFY_IMAGE_PATH_PREFIX) &&
    !decodedSegments.includes("..") &&
    !decodedSegments.includes(".")
  );
}

/** True for an approved static catalog image path. */
export function isLocalProductImagePath(src: string): boolean {
  return LOCAL_PRODUCT_IMAGE_PATTERN.test(src);
}

/** True when `src` is an approved product image source in either mode. */
export function isAllowedProductImageSrc(src: string): boolean {
  return isLocalProductImagePath(src) || isShopifyProductImageUrl(src);
}
