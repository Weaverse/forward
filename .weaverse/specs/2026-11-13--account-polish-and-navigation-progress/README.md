# Feature: Account polish and navigation progress

| Field            | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| **Status**       | in-progress                                               |
| **Owner**        | @hta218                                                   |
| **Issue**        | [#133](https://github.com/Weaverse/forward/issues/133)    |
| **Branch**       | `update/133-account-polish-and-navigation-progress`       |
| **Created**      | 2026-11-13                                                |
| **Last Updated** | 2026-11-13                                                |

## Original Prompt

> OK, done. Now I want to polish these two themes, Forward first. The account routes look rather poor in the UI in a few places, fix these for me:
> 1. The account item in the header shows "Signed in". Just show "Account"; opening the page tells you whether you are logged in.
> 2. This sign-out button: [screenshot] looks huge next to the menu, and placed there it doesn't match. Fix it.
> 3. Why do the order list and order detail page show so little information? At the very least there should be a product/variant image. Look at an order in the Shopify admin: [screenshot] the information is complete and easy to read, like that.
> 4. The back link looks poor: [screenshot]
> 5. The addresses section looks clearly poor: [screenshot] the boxes stick together, the buttons look big, and deleting an address needs a confirmation.
> 6. The whole shop has no loading progress when changing pages, so often after a click you don't know whether anything is happening. It should have one like Pilot's.
> ---
> Create an issue to improve the theme, then do it all in one PR. When the goal is done, commit and open a PR.
> For the account part, I need mock data to bypass auth so I can check locally, so add mock data code. Once I've verified it, delete that code before merging to prod.

## Summary

Brings Forward's account routes closer to Shopify's own order view (product images, variants, SKUs, payment and fulfillment status, tracking), tidies the account navigation, back link and address cards, asks before deleting an address, and adds a top progress bar for client-side page navigation. A temporary, dev-only mock (`FORWARD_ACCOUNT_MOCK=1`) lets the pages be reviewed without signing in; it is removed before merge.
