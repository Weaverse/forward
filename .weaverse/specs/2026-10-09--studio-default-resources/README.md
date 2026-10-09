# Feature: Let Studio resolve Forward's default resources

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | completed                                                                |
| **Owner**        | @hta218                                                                  |
| **Issue**        | N/A (found while testing Weaverse/builder#3119)                          |
| **Branch**       | `update/studio-default-resources`                                        |
| **Created**      | 2026-10-09                                                               |
| **Last Updated** | 2026-10-09                                                               |

## Original Prompt

> I tested it: from Studio's page selector, "All products" opens `/shop` (ok), but the default product, default collection and default page fail with "Not found. Something went wrong, please try again".

The cause was traced to Forward blanking `PUBLIC_STOREFRONT_API_TOKEN` before the SDK sees it, and three options were proposed. The decision:

> Option 1 (Forward stops suppressing `PUBLIC_STOREFRONT_API_TOKEN`) is the standard way; do it.

## Summary

Studio resolves a store's default product, collection and page through `/api/public/pages` with the public Storefront token from the SDK's `publicEnv`. Forward blanked that token, so those page-selector templates could not open. Forward now forwards it, and AGENTS.md records the approval: it is Shopify's public token, made for browsers, and Studio is its only browser use.
