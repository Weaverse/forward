# Feature: Customer and cart buyer-identity sync

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-review                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#144](https://github.com/Weaverse/forward/issues/144) |
| **Branch**       | `feat/cart-buyer-identity-sync`                        |
| **Created**      | 2026-11-25                                             |
| **Last Updated** | 2026-11-25                                             |

## Original Prompt

> #144 open item: customer and cart buyer-identity sync
> (`createCartServerHandlers({customerSession})`). The account handlers in the
> proxy need a real Storefront client first. Sign-in and refresh attach the
> customer to the cart; logout and a rejected refresh detach it, expiring the
> cart cookie if the detach fails; first carts are created with the customer
> attached; cart reads get `logged_in=true` on the checkout URL. Keep the
> keyless browser cart id, the HttpOnly cookie as the only server cart
> identity, and the market sync. Handle Hydrogen's missing `development` build
> for `customer-account` under `next dev`.

## Summary

With Customer Accounts configured, `/api/cart` and the cart page run on
`createCartServerHandlers({ customerSession })`, and the same handlers go to
`createCustomerAccountServerHandlers({ cartServerHandlers })`, as Shopify's
[Customer accounts, step 4](https://shopify.dev/docs/storefronts/hydrogen/customer-accounts#step-4-sync-cart-buyer-identity)
describes. The proxy gives the four protocol routes a real Storefront client
(the catalog's private client, same request context). Hydrogen does the rest.

Under `next dev` the account handlers run without `cartServerHandlers`,
because 2026.10.3's `customer-account` entry has no `development` build and
the cart-sync brands differ. Tests alias `@shopify/hydrogen` to its production
build, so they exercise the shipped pairing.

The market sync (`syncCartCountry`) names the customer as well: the signed-in
token, `null` once the session has ended, or nothing while that can't be told.
`/api/cart` may refresh the token and commits the session; the cart page never
refreshes. The session cookie's `Secure` flag follows one rule everywhere.
