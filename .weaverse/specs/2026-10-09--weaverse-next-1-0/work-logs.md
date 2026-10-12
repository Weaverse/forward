# Work Logs

## 2026-10-09 — @hta218

- Released `@weaverse/next@1.0.0` (same code as alpha.20) and moved Forward to it (#93). `bun run check` and `smoke:routes` (41 checks) passed.
- `smoke:routes` must run against the production Weaverse project: a local `.env` that points `WEAVERSE_HOST` at a local Builder serves a different project, and its custom pages answer 404.

## 2026-10-12 — @hta218

- Manual Studio check on production failed at first: the page selector could not open the default product, collection or page. Forward's Vercel Production env had no `PUBLIC_STOREFRONT_API_TOKEN`, so `publicEnv` carried an empty token (#92 forwards it but cannot supply it).
- Added the token to Vercel Production and redeployed. The page selector, editing and navigation pass. Weaverse/builder#2661 closed.
