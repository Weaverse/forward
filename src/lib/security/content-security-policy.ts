/**
 * The storefront's Content Security Policy, opt-in per store with `CSP_MODE`.
 *
 * - `report-only` (default): browsers report violations and block nothing.
 * - `enforce`: browsers block anything the policy does not allow.
 * - `off`: no policy header.
 *
 * The policy is Hydrogen's defaults plus the sources Weaverse Studio needs
 * while it edits the page. Pages are prerendered, so it carries no nonce: Next
 * cannot nonce a prerendered shell, and Hydrogen's guidance for that case is
 * `nonce: false` with `'unsafe-inline'` scripts. Stores that load third-party
 * scripts, embeds or fonts add their origins to `THEME_DIRECTIVES`.
 */

import {
  type ContentSecurityPolicyDirectives,
  createContentSecurityPolicy,
} from "@shopify/hydrogen";
import { getWeaverseStudioCspDirectives } from "@weaverse/hydrogen/next/server";

export type CspMode = "off" | "report-only" | "enforce";

/** Sources this theme needs beyond Hydrogen's defaults. */
const THEME_DIRECTIVES = {
  /* The country selector's flags (`react-country-flag` with `svg`). */
  imgSrc: ["https://cdn.jsdelivr.net"],
  scriptSrc: [
    "'unsafe-inline'",
    /* Next's development runtime evaluates code; production never does. */
    ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
  ],
} satisfies ContentSecurityPolicyDirectives;

/**
 * Theme directives with Studio's sources appended. Every theme directive is
 * kept, so origins a store adds to `THEME_DIRECTIVES` always reach the policy.
 */
export function mergeCspDirectives(
  theme: ContentSecurityPolicyDirectives,
  studio: ContentSecurityPolicyDirectives,
): ContentSecurityPolicyDirectives {
  const merged: ContentSecurityPolicyDirectives = { ...theme };
  for (const key of Object.keys(studio) as (keyof typeof studio)[]) {
    if (key === "upgradeInsecureRequests") {
      continue;
    }
    merged[key] = [...(theme[key] ?? []), ...(studio[key] ?? [])];
  }
  return merged;
}

/**
 * A store with its own domain gets Shopify-hosted video files on that domain
 * (`https://<checkout domain>/cdn/shop/videos/...`), not on cdn.shopify.com,
 * so the checkout domain is a media source too.
 */
function storeDomainDirectives(
  checkoutDomain: string | undefined,
): ContentSecurityPolicyDirectives {
  return checkoutDomain
    ? { mediaSrc: [`https://${checkoutDomain.replace(/^https?:\/\//, "")}`] }
    : {};
}

export function readCspMode(value = process.env.CSP_MODE): CspMode {
  return value === "off" || value === "enforce" ? value : "report-only";
}

/** Adds the policy for this document request to the response headers. */
export function applyContentSecurityPolicy(
  request: Request,
  headers: Headers,
  mode: CspMode = readCspMode(),
  checkoutDomain: string | undefined = process.env.PUBLIC_CHECKOUT_DOMAIN ||
    undefined,
): void {
  if (mode === "off") {
    return;
  }
  const csp = createContentSecurityPolicy({
    shop: { storeDomain: process.env.PUBLIC_STORE_DOMAIN, checkoutDomain },
    nonce: false,
    directives: mergeCspDirectives(
      mergeCspDirectives(
        THEME_DIRECTIVES,
        storeDomainDirectives(checkoutDomain),
      ),
      getWeaverseStudioCspDirectives(request),
    ),
  });
  if (mode === "enforce") {
    csp.applyResponseHeaders(headers);
  } else {
    headers.set("Content-Security-Policy-Report-Only", csp.header);
  }
}
