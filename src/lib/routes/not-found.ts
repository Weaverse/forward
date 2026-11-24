import { headers } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { findShopifyRedirect, STOREFRONT_URL_HEADER } from "./shopify-routes";

/**
 * `notFound()`, unless Shopify would send the URL elsewhere: `/admin` to the
 * store's admin, Shopify's default resource paths to Forward's, and the
 * store's own URL redirects.
 *
 * Routes call this where they would call `notFound()`, so ordinary pages never
 * pay for the lookup. It is not done in `not-found.tsx`: Next renders that
 * boundary with the 404 status already set, so a redirect there only happens
 * in the browser.
 */
export async function shopifyRedirectOrNotFound(): Promise<never> {
  const url = (await headers()).get(STOREFRONT_URL_HEADER);
  const target = url === null ? null : await findShopifyRedirect(url);
  if (target === null) notFound();
  if (target.permanent) permanentRedirect(target.location);
  redirect(target.location);
}
