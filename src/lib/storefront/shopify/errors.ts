/**
 * Sanitized adapter errors.
 *
 * Rules that these types exist to enforce:
 *
 * - an error may name a missing environment key, never a value;
 * - no token, authorization header, request URL, signed CDN parameter, or raw
 *   Storefront response body may appear in a message;
 * - once Shopify mode is selected the adapter fails closed — these errors are
 *   thrown, never swallowed into a fixture fallback.
 */

/** Environment/setup problem detected before any network call. */
export class ShopifyConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyConfigurationError";
  }
}

/** Transport, GraphQL, validation, or mapping failure in Shopify mode. */
export class ShopifyCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyCatalogError";
  }
}

/**
 * Safe label for a caught value. Only the error class name is used, because
 * Storefront error messages can carry query text and request context.
 */
export function safeErrorLabel(error: unknown): string {
  if (error instanceof ShopifyConfigurationError) {
    return "ShopifyConfigurationError";
  }
  if (error instanceof ShopifyCatalogError) {
    return "ShopifyCatalogError";
  }
  if (error instanceof TypeError) {
    return "TypeError";
  }
  if (error instanceof Error) {
    return "Error";
  }
  return "UnknownError";
}
