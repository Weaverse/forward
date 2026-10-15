# Work Logs

## 2026-10-15 — @hta218

- Opened #103 as a sub-issue of Weaverse/weaverse#541.
- Split `AGENTS.md` into the public root file and `.weaverse/AGENTS.md`.
- Added `LICENSE.md` (MIT, Weaverse JSC, matching Pilot).
- Set Forward to `1.0.0` in `package.json` and `themeSchema.info.version`.
- `bun run check` passes. `smoke:routes` was not run locally: the local
  `WEAVERSE_HOST` points at a personal dev Studio that answers 404.
- Left for review: `README.md` still says market routing is deferred and that
  cart, checkout and Customer Account are future work, and lists the demo
  store's smoke handles; `src/lib/routes/route-contract.ts` cites an internal
  spec path in a comment that scaffolded copies cannot resolve.

## 2026-10-15 — @hta218 (CLI scaffold test)

- Scaffolding Forward with the new `@weaverse/cli create --template forward` and adding only the three Shopify keys still answered 500: `.env.example` shipped `PUBLIC_STOREFRONT_ORIGIN=https://your-deployment.example`, a placeholder in the all-or-none Customer Account group, so the group read as partially configured.
- `.env.example` now leaves `PUBLIC_STOREFRONT_ORIGIN` empty (the example moved into the comment), states that both catalog keys are required (the old "both empty -> static fixtures" note predates removing static mode), and describes `PUBLIC_STOREFRONT_API_TOKEN` as the Studio token it is.
- With that, the scaffolded project serves `/` and `/shop` with 200 once the three Shopify keys are set.
