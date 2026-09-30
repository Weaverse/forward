# Feature: Keep the market on client and server redirects

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| **Status**       | completed                                            |
| **Owner**        | @hta218                                              |
| **Issue**        | [#86](https://github.com/Weaverse/forward/issues/86) |
| **Branch**       | `feat/locale-routing`                                |
| **Created**      | 2026-09-30                                           |
| **Last Updated** | 2026-09-30                                           |

## Original Prompt

> Found while testing #68 (PR #83). Two navigations bypass the theme `Link`, so they drop the market prefix and send the shopper to the US market. Will be fixed in PR #83.
>
> ## 1. PDP jumps back to the US market
>
> On `/en-gb/shop`, clicking a product card opens `/en-gb/products/approach-18-day-pack`, then immediately jumps to `/products/approach-18-day-pack?colorway=moss-charcoal`.
>
> `MainProduct` (`src/sections/main-product/index.tsx`) replaces the URL with the canonical selection href from `productSelectionHref`, which is unprefixed. `router.replace` does not go through the theme `Link`, so every PDP on a non-default market redirects to US.
>
> - [ ] Localize the canonical href with the current locale before comparing and replacing
> - [ ] DOM test: a PDP in `de-de` replaces to `/de-de/products/...`
>
> ## 2. Saving an address leaves the market
>
> `saveAddress` (`src/lib/account/address-actions.ts`) redirects to the unprefixed `/account/addresses`, so saving on `/de-de/account/addresses` lands on the US market.
>
> - [ ] Redirect to the addresses page in the shopper's market (`forward_locale` cookie)

## Summary

Two navigations bypass the theme `Link` and dropped the market prefix: the
PDP's canonical selection `router.replace` and the address Server Action's
success redirect. Both now localize their target. Fixed inside PR #83.
