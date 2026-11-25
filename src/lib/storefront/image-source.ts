/**
 * Allowed sources for normalized storefront imagery: Shopify CDN media from
 * any shop. The same allowlist backs the Next Image remote pattern in
 * `next.config.ts`.
 *
 * This module has no dependencies on purpose: it is imported by the Next config
 * as well as by server-only Shopify mapping code.
 */

/** The exact Shopify CDN hostname the Storefront API serves media from. */
export const SHOPIFY_IMAGE_HOSTNAME = "cdn.shopify.com";

/**
 * Shopify's public file path, shared by every shop. The shop's own folder
 * follows it (`/s/files/1/<shop>/...`), so the theme is not tied to one store;
 * collection and article images live under the same prefix.
 */
export const SHOPIFY_IMAGE_PATH_PREFIX = "/s/files/";

/**
 * Local stand-in for a product the store published without any image. Its
 * 4:5 box matches the product card and PDP frames.
 */
export const PRODUCT_PLACEHOLDER_IMAGE = {
  src: "/images/placeholder/product.svg",
  width: 1200,
  height: 1500,
} as const;

/** True for the placeholder, which structured data and OpenGraph leave out. */
export function isPlaceholderImage(image: { src: string }): boolean {
  return image.src === PRODUCT_PLACEHOLDER_IMAGE.src;
}

/** True for a Shopify CDN media URL (https, exact host, files path). */
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
