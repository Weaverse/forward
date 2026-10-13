# Feature: Collection list at /categories

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | completed                                                |
| **Owner**        | @hta218                                                  |
| **Issue**        | [#98](https://github.com/Weaverse/forward/issues/98)     |
| **Branch**       | `feat/categories-collection-list`                        |
| **Created**      | 2026-10-13                                               |
| **Last Updated** | 2026-10-13                                               |

## Original Prompt

> Next, I noticed there is no /collections route yet, right?

> I want to use the route /categories to make it special, OK?

> Use categories.

## Summary

Forward had no collection list page: `/collections` answered 404 and Studio's page selector could not open one. The collection list becomes the Weaverse `COLLECTION_LIST` page at `/categories`, composed from a section tree that renders every collection the store publishes; `/collections` redirects there. Only the URL says "categories": in code and Studio it is the collection list, since "category" already means `productType` in Forward.
