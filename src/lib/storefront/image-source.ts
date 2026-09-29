/**
 * Allowed sources for normalized storefront imagery: the store's own Shopify
 * CDN media. The same allowlist backs the Next Image remote pattern in
 * `next.config.ts`.
 *
 * This module has no dependencies on purpose: it is imported by the Next config
 * as well as by server-only Shopify mapping code.
 */

/** The exact Shopify CDN hostname that serves this store's owned media. */
export const SHOPIFY_IMAGE_HOSTNAME = "cdn.shopify.com";

/**
 * Exact public CDN tenant path for the owned Forward Shopify store. Scoped to
 * the tenant rather than its `files/` folder: collection images are served
 * from the sibling `collections/` folder.
 */
export const SHOPIFY_IMAGE_PATH_PREFIX = "/s/files/1/0978/4757/4828/";

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
