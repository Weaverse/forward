# Feature: Fix cart currency, price formatting and market switching across markets

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| **Status**       | completed                                            |
| **Owner**        | @hta218                                              |
| **Issue**        | [#85](https://github.com/Weaverse/forward/issues/85) |
| **Branch**       | `feat/locale-routing`                                |
| **Created**      | 2026-09-30                                           |
| **Last Updated** | 2026-09-30                                           |

## Original Prompt

> Found while checking every route on every market for #68 (PR #83). Will be fixed in PR #83.
>
> ## 1. The cart keeps the currency of the market it was created in
>
> A cart created on US and then read or added to under DE still returns `USD` and `buyerIdentity.countryCode: US` (confirmed against the live store). Shopify does not re-price a cart from `@inContext`, and nothing calls `cartBuyerIdentityUpdate`. A shopper who adds to cart on US and switches to `/de-de` sees USD in the mini cart and at checkout.
>
> - [ ] In `/api/cart`, when the cart's country differs from the market in the locale cookie, update the buyer identity country before answering
>
> ## 2. Prices drop a trailing zero
>
> `formatMoney` (`src/lib/storefront/format.ts`) sets `minimumFractionDigits: 0`, so converted prices render as `£228.2` and `€141.3`. Whole USD prices hid this on main.
>
> - [ ] Use `trailingZeroDisplay: "stripIfInteger"`: `$248` stays, `£228.2` becomes `£228.20`
>
> ## 3. Switching market drops the query string
>
> The market selector links to the pathname only, so switching market resets filters, sort and `?colorway=`.
>
> - [ ] Carry the current query string into each market link
>
> ## Test
>
> - [ ] Unit test for each fix

## Summary

Three market bugs found by checking every route on every market for #68: a
cart kept the currency of the market it was created in, converted prices
dropped a trailing zero, and switching market lost the query string. Fixed
inside PR #83.
