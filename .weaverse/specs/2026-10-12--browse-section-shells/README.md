# Feature: Browse shells on the shared Section

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @hta218                                                  |
| **Issue**        | N/A                                                      |
| **Branch**       | `update/browse-section-shells`                           |
| **Created**      | 2026-10-12                                               |
| **Last Updated** | 2026-10-12                                               |

## Original Prompt

> Now look at the /shop route. Why is the text pushed against the left edge? Did we forget to wrap the section in the shared section component?

> Have you compared it with Pilot?

> A full-bleed toolbar like this is fine; the rest of your plan is OK, go ahead.

## Summary

The `/shop` heading and lede rendered flush against the left edge: the `all-products` shell was a bare `div` with no page container, and the header lost its wrapper when the route-level fallback was dropped. Both browse shells now render through the shared `Section` (full width by default, so the toolbar stays full-bleed), and a new `ap--header` child puts the heading and lede on the page measure.
