# Feature: Customer Account API rate limits

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Status**       | in-review                                                      |
| **Owner**        | @hta218                                                        |
| **Issue**        | [#144](https://github.com/Weaverse/forward/issues/144) (part)  |
| **Branch**       | `customer-account-429`                                         |
| **Created**      | 2026-11-25                                                     |
| **Last Updated** | 2026-11-25                                                     |

## Original Prompt

> Handle Customer Account API rate limits (HTTP 429 / `Retry-After`). Reads: retry once, honouring `Retry-After`, only when the wait is a few seconds, then surface a clear error. Mutations: never auto-retry, because the mutation may already have been applied; return a clear "Too many requests, please try again in N seconds" error through the existing form error UI. OAuth token calls: don't double-wrap Hydrogen; make sure a 429 during refresh is transient, not a sign-out.

## Summary

Every account read and write goes through the client `readAccountSession` builds. That client is now wrapped by `withRateLimitPolicy` (`src/lib/account/rate-limit.ts`):

- A rate-limited **query** is retried once after `Retry-After` (1 second when absent), only when the wait is at most 2 seconds. Otherwise, or on a second 429, it throws `CustomerAccountRateLimitError`.
- A rate-limited **mutation** (the operation type is read from the document) is never re-sent. It throws `CustomerAccountRateLimitError` straight away. The address action maps that to `account.addressErrors.rateLimited` ("Too many requests, please try again in {{seconds}} seconds.") or `rateLimitedBriefly` when the wait is unknown or 1 second.

Hydrogen 2026.10.3 reports a 429 as `CustomerAccountApiError` with `status: 429` and `retryAfter` (the raw header), and never retries. Its token refresh maps a 429 to a transient result and keeps the tokens, so the session survives. Its code exchange maps a 429 to `token_exchange_failed` (the login-failed path). Neither OAuth call is wrapped here.
