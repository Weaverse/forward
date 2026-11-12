# Feature: Hydrogen locale APIs and an opt-in Content Security Policy

| Field            | Value                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| **Status**       | completed                                                                                                      |
| **Owner**        | @hta218                                                                                                        |
| **Issue**        | [#126](https://github.com/Weaverse/forward/issues/126), [#127](https://github.com/Weaverse/forward/issues/127), [#129](https://github.com/Weaverse/forward/issues/129), [#130](https://github.com/Weaverse/forward/issues/130) |
| **Branch**       | `update/126-127-hydrogen-locale-and-csp`                                                                       |
| **Created**      | 2026-11-12                                                                                                     |
| **Last Updated** | 2026-11-12                                                                                                     |

## Original Prompt

> When there's an update, we have to check whether we can use the new APIs. How can we leave deprecated code in use?

> I approve all of it. In phase 2, items 3 and 5 can ship in the same PR; having 2 issues to track them is fine. Go ahead.

> So 2 issues in Forward, create them, then do the work in this current PR. The goal is to finish without asking, then push to this PR (remember to update the description), then once the Vercel preview has deployed, open a browser yourself and test whether bugs remain; if it's OK I'll test again.

## Summary

Moves Forward off the locale APIs `@shopify/hydrogen` 2026.10.3 deprecates by defining the markets once with `defineShopifyI18n`, and adds a Content Security Policy that each store switches with `CSP_MODE` (report-only by default). Uses `@weaverse/hydrogen` 6.3.0 for the Weaverse Studio CSP sources. Also fixes the cart following the wrong market after a market switch.
