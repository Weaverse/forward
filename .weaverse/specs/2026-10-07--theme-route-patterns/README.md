# Feature: Declare Forward's routes for Studio navigation

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | in-progress                                                              |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [Weaverse/weaverse#518](https://github.com/Weaverse/weaverse/issues/518) |
| **Branch**       | `feat/theme-route-patterns`                                              |
| **Created**      | 2026-10-07                                                               |
| **Last Updated** | 2026-10-07                                                               |

## Original Prompt

> Now the goal is to work through each repo in turn (SDK, Builder, Forward); when done, commit in multiple commits and open the PRs. Leave the package release steps for later. Just do the work and open all the PRs in one pass first.

Context: the prompt resolves Weaverse/weaverse#518. Forward is the theme that motivated it: Studio's page selector builds Shopify URLs (`/collections/:handle`, `/blogs/:blog/:handle`), which Forward does not serve.

## Summary

Forward's theme schema declares `routes` where it differs from the Shopify convention, so Studio's page selector and URL picker navigate to `/shop`, `/shop/:handle` and `/journal/:handle`. A test keeps every declared route on a route the app serves.
