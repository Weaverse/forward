# Feature: Collection route filters

| Field            | Value                                   |
| ---------------- | --------------------------------------- |
| **Status**       | in-progress                             |
| **Owner**        | @hta218                                 |
| **Issue**        | [#78](https://github.com/Weaverse/forward/issues/78) |
| **Branch**       | `feat/collection-route-filters`         |
| **Created**      | 2026-09-21                              |
| **Last Updated** | 2026-09-21                              |

## Original Prompt

> Check the collection filters for me. Right now only `/shop` has filters; routes of the form `/shop/<collection-handle>` do not. Why?
>
> Compare it with Pilot's collection page.
>
> Go with option A, the Pilot model. I need an issue on Forward first — create it with `/create-task`.
>
> Good, now `/work` it. The goal is to finish; when done, commit in multiple commits, one commit per child element. Then push and open a PR.

## Summary

`/shop/<collectionHandle>` handed all rendering to Weaverse and parsed no query
state, so nothing on a collection page held filter or sort. This replaces the
opaque `collection-grid` with a `main-collection` tree — toolbar, content,
filters, product grid — driven by URL query state the route resolves through
the storefront seam. Only Pilot's file organization is borrowed; the facet
model, components and styling are Forward's own.
