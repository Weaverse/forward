# Feature: Keep menus on non-default markets

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| **Status**       | completed                                            |
| **Owner**        | @hta218                                              |
| **Issue**        | [#84](https://github.com/Weaverse/forward/issues/84) |
| **Branch**       | `feat/locale-routing`                                |
| **Created**      | 2026-09-30                                           |
| **Last Updated** | 2026-09-30                                           |

## Original Prompt

> Found while testing #68 (PR #83). The header menu, footer menu and Shop panel are empty on every non-default market (`/en-gb`, `/de-de`, `/fr-fr`, `/ja-jp`). Only the default market (US) shows them.
>
> Will be fixed in PR #83.
>
> ## Cause
>
> The navigation query runs under `@inContext(country, language)`. For a non-default market, Shopify returns menu URLs prefixed with that market's subfolder (e.g. `/en-gb/collections/forward`). `readStorePath` + `toThemePath` match the whole pathname against Shopify paths, so every prefixed item maps to `null` and is dropped.
>
> ## Fix
>
> - [ ] Read the menu item `type` in the navigation query
> - [ ] Map internal items by `type` + trailing handle segment(s), so the market subfolder does not matter
> - [ ] Keep `HTTP` items on the current same-origin check + `toThemePath`
> - [ ] Check content links that go through `toThemePath` for the same problem
> - [ ] Unit test the mapper with market-prefixed URLs
> - [ ] Run `bun run check:graphql`

## Summary

Shopify returns every menu URL under the market's subfolder
(`/en-gb/collections/forward`) when read in that market's context, so the
theme's route mapper dropped every item and non-default markets rendered no
menus. The mapper now drops that subfolder before matching, and the theme
`Link` adds the shopper's market back. Fixed inside PR #83 (#68).
