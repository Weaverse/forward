# Work Logs

## 2026-10-23 — @hta218
- Checked outdated dependencies, Hydrogen 2026.10.2 compatibility and Vercel Shop's versions.
- Opened #109 and this spec (#110).

## 2026-10-26 — @hta218
- Bumped Hydrogen to 2026.10.2, Next 16.4.2, React 19.3.1, React types 19.3, Playwright 1.64.1, Testing Library patches and `@types/node` 22.20.5.
- `typecheck` found a change not listed in #96: `config.buyerIp` was removed from the private Storefront client. Removed it; the request context already carries the buyer IP.
- Migrated addresses from `territoryCode` to `countryCode`, typed as the `CountryCode` enum. The i18n keys `account.fields.territoryCode` / `territoryCodeHint` keep their names, so existing Studio translations still apply.
- Tried Biome 2.6.2 and deferred it: Markdown formatting churn and mostly false-positive new rules (details in `plan.md`).
- Force-synced the Hydrogen agent skills (4 added, 16 updated, including `migrate-to-hydrogen-2026-10` and `hydrogen-customer-account`).
- Self-review: a well-formed but unassigned code (such as `XX`) fails enum coercion as a top-level GraphQL error and shows the `failed` message instead of `invalid`. Accepted for now; a country `<select>` would remove it.
