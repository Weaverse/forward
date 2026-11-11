# Feature: Update dependencies

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | completed                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#122](https://github.com/Weaverse/forward/issues/122) |
| **Branch**       | `update/122-update-dependencies`                       |
| **Created**      | 2026-11-11                                             |
| **Last Updated** | 2026-11-11                                             |

## Original Prompt

> Quickly create an issue to update deps for me, use /create-task

> Alright, do it, check out from main, then /commit and open a PR for me

## Summary

Bump Forward's dependencies to their latest minor/patch versions and keep the
`check` gate green. Major upgrades (TypeScript 7) are left out of this pass.
