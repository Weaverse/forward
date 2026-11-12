/**
 * The storefront's public origin, for the absolute URLs in `sitemap.xml` and
 * `robots.txt`.
 *
 * `PUBLIC_SITE_URL` wins. On Vercel, the project's production domain
 * (`VERCEL_PROJECT_PRODUCTION_URL`, set at build and run time) is used, so
 * preview builds advertise production URLs too. Elsewhere it falls back to
 * the local dev origin, as Next's own `metadataBase` does. The request `Host`
 * is never an input. A malformed value throws.
 */
export function siteBaseUrl(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const configured = env.PUBLIC_SITE_URL?.trim();
  if (configured) {
    return new URL(configured).origin;
  }
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercel ? new URL(`https://${vercel}`).origin : "http://localhost:3000";
}
