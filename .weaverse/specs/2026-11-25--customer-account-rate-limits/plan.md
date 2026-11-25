# Plan

1. `src/lib/account/rate-limit.ts`: `withRateLimitPolicy(client)`, `retryAfterSeconds()` (delta-seconds or HTTP date), and `CustomerAccountRateLimitError`.
2. `readAccountSession` wraps the client it returns, so all reads and the address mutations go through the policy.
3. `runAddressMutation` maps `CustomerAccountRateLimitError` to the new rate-limit messages. The action state carries the message's `variables`, and the form passes them to `t()`.
4. Two new `account.addressErrors` keys in `static-content.ts`.
5. Tests: `tests/customer-account-rate-limit.test.ts`. They cover a query retried once and then succeeding, a query still limited after its retry, a long `Retry-After` not waited out, a mutation sent once with the friendly message, `Retry-After` parsing, and a 429 on refresh keeping the session.

## Files

- `src/lib/account/rate-limit.ts`
- `src/lib/account/account-view.ts`
- `src/lib/account/addresses.ts`
- `src/lib/account/address-action-state.ts`
- `src/lib/account/address-actions.ts`
- `src/app/[locale]/account/addresses/address-form.tsx`
- `src/lib/i18n/static-content.ts`
- `tests/customer-account-rate-limit.test.ts`
- `.weaverse/specs/2026-11-25--customer-account-rate-limits/`

## Out of scope

- Read pages that still fail after the retry throw to the route's error boundary. No new page UI.
- After a transient refresh failure, `readAccountSession` keeps its existing one-refresh bound (`needs-refresh`, then `signed-out` on the way back) without clearing the session.
