# Feature: Main product children

| Field            | Value                             |
| ---------------- | --------------------------------- |
| **Status**       | in-progress                       |
| **Owner**        | @hta218                           |
| **Issue**        | N/A                               |
| **Branch**       | `update/main-product-children`    |
| **Created**      | 2026-09-18                        |
| **Last Updated** | 2026-09-18                        |

## Original Prompt

> Review the product route for me. The main product section has no settings and no child elements at all. It needs to follow Pilot: the section split into children across a full 3 levels, a dedicated child for each element, and complete, proper settings. Just use Pilot's structure as the reference.
> The goal is to finish without asking me anything; when done, commit in multiple commits (one separate commit per child), then push and open a PR for me.

## Summary

`main-product` wrapped the whole PDP buy block as one opaque component with no settings. It becomes a three-level tree — the section, a media column and an info column, and one child per element (breadcrumb, meta row, title, prices, summary, variant selector, buy buttons, collapsible details) — each with its own settings. Only Pilot's file organization is borrowed; the implementation is Forward's own.
