# Feature: Adopt @weaverse/next 0.1.0-alpha.19 and Studio outline labels

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | completed                                                |
| **Owner**        | @hta218                                                  |
| **Issue**        | [#89](https://github.com/Weaverse/forward/issues/89)     |
| **Branch**       | `feat/studio-outline-labels`                             |
| **Created**      | 2026-10-07                                               |
| **Last Updated** | 2026-10-07                                               |

## Original Prompt

> Then move on to Forward.

Given right after `@weaverse/next@0.1.0-alpha.19` was released. It refers to step 4 of the `@weaverse/next` stable release plan (Weaverse/builder#2661), quoted verbatim:

> 4. [ ] Forward consumer update
>    - [ ] Bump to alpha.19 and drop the `buildRequestContext` pathPrefix workaround
>    - [ ] Weaverse/forward#89 — dynamic Studio outline labels
>    - [ ] Manual Studio QA (Leo)

## Summary

Forward moves to `@weaverse/next@0.1.0-alpha.19`, which applies the market path prefix itself (Weaverse/weaverse#534), so the theme stops prefixing the request path. On `@weaverse/schema` 0.17.0, text-bearing and repeated elements declare a typed `label` callback, so Studio's outline names each instance (`Heading – Summer sale`) instead of repeating the component title.
