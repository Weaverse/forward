# Plan

## Scope

Minor/patch bumps only, pinned exactly where the repo already pins:

| Package                         | From      | To        |
| ------------------------------- | --------- | --------- |
| `@shopify/hydrogen`             | 2026.10.2 | 2026.10.3 |
| `@weaverse/hydrogen`            | 6.1.2     | 6.1.3     |
| `next`                          | 16.4.3    | 16.4.6    |
| `parse5`                        | 8.0.1     | 8.1.1     |
| `@playwright/test`              | 1.64.1    | 1.65.0    |
| `@testing-library/user-event`   | 14.6.8    | 14.6.9    |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | 4.3.5   |
| `@types/node`                   | 26.6.5    | 26.6.6    |
| `vite-plus` / `vite` (vite-plus-core) | 1.3.0 | 1.6.0   |

## Out of scope

- `typescript` 5.9.3 → 7.x: major (native compiler). Needs its own issue.

## Verification

- `bun run check`

## Files touched

- `package.json`
- `bun.lock`
- `.weaverse/specs/2026-11-11--update-dependencies/`
