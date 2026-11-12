# Feature: Sign-out returns to the shopper's market

| Field            | Value                                 |
| ---------------- | ------------------------------------- |
| **Status**       | in-progress                           |
| **Owner**        | @hta218                               |
| **Issue**        | N/A                                   |
| **Branch**       | `fix/sign-out-returns-to-market`      |
| **Created**      | 2026-11-12                            |
| **Last Updated** | 2026-11-12                            |

## Original Prompt

> If the redirect happens silently on the server and the shopper doesn't see it, that's fine. Try it, let me see; try it in Forward.

Context: signed in on `/de-de`, signing out landed on `/` instead of `/de-de`. The proposal was a single fixed post-logout URI (`/account/signed-out`) that redirects to the market's home from the locale cookie, so stores register one logout URI instead of one per market.

## Summary

Shopify only returns a sign-out to a registered logout URI, so a per-market `return_to` needed every market's home registered and fell back to `/` otherwise. Every sign-out now lands on `/account/signed-out`, which the proxy redirects (303, no page) to the home of the market in the `forward_locale` cookie.
