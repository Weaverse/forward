# Feature: Store-driven catalog

| Field            | Value                                   |
| ---------------- | --------------------------------------- |
| **Status**       | completed                               |
| **Owner**        | @hta218                                 |
| **Issue**        | [#80](https://github.com/Weaverse/forward/issues/80) |
| **Branch**       | `feat/collection-route-filters`         |
| **Created**      | 2026-09-22                              |
| **Last Updated** | 2026-09-22                              |

## Original Prompt

> Next, the filters — where are the facets coming from right now?
>
> I connected Pilot to this store and it only has these two filters
> [Availability, Price]. So Forward's filters are completely hardcoded, right?
>
> Do it now, it belongs in this PR #79. Remove all the hardcoding — how else
> could it run on a different real store? It has to work the way Pilot does.

## Summary

Forward's catalog was a fixed set of nine theme-declared products: Shopify
supplied copy, price and images, while the ownership tag, the handle allowlist
and the per-handle presentation profiles decided everything else — including
the Activity and Category facets, which exist in no Shopify store. This makes
the catalog store-driven: facets come from the Storefront API's own filter
connection, and every field previously read from a profile is sourced from the
store or retired.
