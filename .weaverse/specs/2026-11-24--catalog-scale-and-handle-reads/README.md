# Feature: Catalog scale and by-handle reads

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-progress                                            |
| **Owner**        | @hta218                                                |
| **Issue**        | [#142](https://github.com/Weaverse/forward/issues/142) |
| **Branch**       | `fix/forward-142-catalog-by-handle`                    |
| **Created**      | 2026-11-24                                             |
| **Last Updated** | 2026-11-24                                             |

## Original Prompt

> #142: lift the 10-product / 10-collection caps, default-option products, optional editorial fields, product lookup by handle, resources reachable without a rebuild.

## Summary

The whole-catalog read pages through the store instead of failing past ten
products, a product page reads its own product by handle, the collection list
reads up to Shopify's page maximum, and handle routes render new resources on
request instead of only the handles known at build time. Default-option
products and optional editorial fields are a separate follow-up.
