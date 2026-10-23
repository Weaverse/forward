# Feature: Upgrade to Hydrogen 2026.10 and bump low-risk dependencies

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | draft                                                                    |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [#109](https://github.com/Weaverse/forward/issues/109), part of [Weaverse/weaverse#543](https://github.com/Weaverse/weaverse/issues/543) |
| **Branch**       | `update/hydrogen-2026-10`                                                |
| **Created**      | 2026-10-23                                                               |
| **Last Updated** | 2026-10-23                                                               |

## Original Prompt

> Check the dependency updates for me.
>
> Can Hydrogen 2026.10.2 really be upgraded? This version is framework agnostic (there is an epic for it already, read it, I think it's in the builder repo). I planned to upgrade at that point. Also look at the Vercel Shop example to see what can be upgraded.
>
> Hold on, create an issue first, use /create-task, assign me, then commit these insights into specs and open a PR for me.

## Summary

Forward still pins a July 2026 Hydrogen preview snapshot. The framework-agnostic SDK is now stable as `@shopify/hydrogen@2026.10.2`, and Vercel Shop already runs it with Next 16.4 and React 19.3. This spec records the compatibility check and plans the upgrade, with one required code change: migrating customer addresses from `territoryCode` to `countryCode`.
