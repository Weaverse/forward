/**
 * Customer Account API rate limits (HTTP 429 with `Retry-After`).
 *
 * Every account read and write goes through the client `readAccountSession`
 * builds, and that client is wrapped here. A query is retried once when
 * Shopify asks for a short wait. A mutation is never retried: the rate-limited
 * request may already have been applied, and a second address create would
 * duplicate it.
 */

import {
  type AnyCustomerAccountDocument,
  CustomerAccountApiError,
  type CustomerAccountClient,
  type CustomerAccountGqlRestParam,
} from "@shopify/hydrogen/customer-account";

const TOO_MANY_REQUESTS = 429;

/** The longest `Retry-After` a query waits out before its one retry. */
export const MAX_READ_RETRY_WAIT_SECONDS = 2;

/** The wait before a query's retry when a 429 carries no `Retry-After`. */
const DEFAULT_READ_RETRY_WAIT_SECONDS = 1;

/** A rate-limited request that was not, or could no longer be, retried. */
export class CustomerAccountRateLimitError extends Error {
  /** Whole seconds Shopify asked to wait, when it said. */
  readonly retryAfterSeconds: number | undefined;

  constructor(retryAfterSeconds: number | undefined) {
    super("The Customer Account API rate limit was reached.");
    this.name = "CustomerAccountRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Whole seconds from a `Retry-After` header (delta-seconds or an HTTP date),
 * or `undefined` when it is absent or unreadable.
 */
export function retryAfterSeconds(
  value: string | undefined,
  now: number = Date.now(),
): number | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  const seconds = /^\s*\d+\s*$/.test(value)
    ? Number(value)
    : (Date.parse(value) - now) / 1000;
  return Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : undefined;
}

function isRateLimited(error: unknown): error is CustomerAccountApiError {
  return (
    error instanceof CustomerAccountApiError &&
    error.status === TOO_MANY_REQUESTS
  );
}

/** Whether the document's operation is a mutation (comments ignored). */
function isMutation(document: AnyCustomerAccountDocument): boolean {
  return /^\s*mutation\b/m.test(document.source.replace(/#[^\n]*/g, ""));
}

function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

/** The client with Forward's rate-limit policy around every request. */
export function withRateLimitPolicy(
  client: CustomerAccountClient,
): CustomerAccountClient {
  async function graphql<const Doc extends AnyCustomerAccountDocument>(
    document: Doc,
    ...rest: CustomerAccountGqlRestParam<Doc>
  ) {
    try {
      return await client.graphql(document, ...rest);
    } catch (error) {
      if (!isRateLimited(error)) {
        throw error;
      }
      const seconds = retryAfterSeconds(error.retryAfter);
      const delay = seconds ?? DEFAULT_READ_RETRY_WAIT_SECONDS;
      if (isMutation(document) || delay > MAX_READ_RETRY_WAIT_SECONDS) {
        throw new CustomerAccountRateLimitError(seconds);
      }
      await wait(delay);
      try {
        return await client.graphql(document, ...rest);
      } catch (retryError) {
        throw isRateLimited(retryError)
          ? new CustomerAccountRateLimitError(
              retryAfterSeconds(retryError.retryAfter),
            )
          : retryError;
      }
    }
  }
  return { apiUrl: client.apiUrl, graphql };
}
