# Feature: Predictive search

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-review                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#144](https://github.com/Weaverse/forward/issues/144) |
| **Branch**       | `feat/predictive-search`                               |
| **Created**      | 2026-11-25                                             |
| **Last Updated** | 2026-11-25                                             |

## Original Prompt

> #144 open item: predictive search through Hydrogen's handlers, plus new
> search UI. Use Hydrogen 2026.10.3's `/api/predictive-search` handler,
> registered in the proxy's `handleShopifyRoutes`, in the request's market.
> Show products, collections, pages, articles and query suggestions as the
> shopper types in the existing search entry point, with debounce, aborted
> stale requests, an accessible combobox, loading and empty states and a
> "view all results" link to `/search`.

## Summary

The proxy registers Hydrogen's `createPredictiveSearchServerHandlers` with
its built-in query. The search page's field is now a combobox over that
handler, called under the page's locale prefix so results carry the market's
prices and translations. Raw Storefront shapes are mapped to Forward paths in
`src/lib/storefront/predictive-search.ts`, which also drops any image outside
the Shopify CDN allowlist.
