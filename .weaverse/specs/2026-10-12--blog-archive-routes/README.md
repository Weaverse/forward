# Feature: Blogs at /archive/:blog and a composed /journal

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @hta218                                                  |
| **Issue**        | [#95](https://github.com/Weaverse/forward/issues/95)     |
| **Branch**       | `feat/blog-archive-routes`                               |
| **Created**      | 2026-10-12                                               |
| **Last Updated** | 2026-10-12                                               |

## Original Prompt

> Wait, there are bugs:
> - navigating to the default blog from the page selector goes to /blogs/news, but shows "No Weaverse content on this page"
> - navigating to the default article still fails with Not Found

> Blog: /<a-fancy-word>/:blog
> Article: /journal/:article
> This is what I want, is that OK?

> 1. Use "archive".
> 2. Then we need a dedicated section for all articles, querying through that section's loader function.
> 3. OK (accept article handle collisions across blogs).
> Go ahead and implement it.

## Summary

Studio could not open Forward's blog pages: there was no `BLOG` route, and `/journal` was theme-rendered rather than a Weaverse page. Blogs are now Weaverse `BLOG` pages at `/archive/:blog`, `/journal` becomes a Weaverse `CUSTOM` page built from a dedicated all-articles section that loads its own articles, and Shopify's `/blogs/*` paths redirect by pattern. The default-article failure is Builder's (Weaverse/builder#3177).
