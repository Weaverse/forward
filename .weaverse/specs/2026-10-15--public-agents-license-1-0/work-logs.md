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
