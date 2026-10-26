# Feature: Theme copy as JSON with German, French and Japanese bundles

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | in-progress                                                              |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [#111](https://github.com/Weaverse/forward/issues/111), docs: [Weaverse/docs#104](https://github.com/Weaverse/docs/issues/104) |
| **Branch**       | `feat/theme-translations`                                                |
| **Created**      | 2026-10-26                                                               |
| **Last Updated** | 2026-10-26                                                               |

## Original Prompt

> Hmm, why isn't that static-content a JSON file? Look at our translation docs again, and check Pilot too.
>
> So if JSON keeps the types, I think we should use a JSON file; the comments don't really matter.
>
> 1. Then use the `src/translations` folder for the JSON translation files.
> 2. Then I think we should do it like Pilot. How many demo markets are we setting up?
>
> 2. Create 2 issues, in the forward and docs repos. Then do it right away. The goal is to finish both, /commit in multiple commits, and open 2 PRs for me to review.

## Summary

Forward's theme copy moves from a TypeScript object to `src/translations/en.json`, and ships German, French and Japanese bundles for its `de-de`, `fr-fr` and `ja-jp` markets. As in Pilot, the server merges the market's language over English and passes it as `staticContent`, so non-English markets are translated out of the box while Studio translations still win.
