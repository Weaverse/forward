# Plan

## Approach

1. Split `AGENTS.md` by audience. A rule stays in the root file when it guides
   anyone developing on Forward. It moves verbatim to `.weaverse/AGENTS.md`
   when it names a person, an approval, an internal spec path, an internal
   process, or history a customer never had. Rules introduced as "Approved
   change (date)" keep their text in the root file without the prefix; the
   dates and retired-file lists move to an approval record in the internal
   file. Every rule ends up in exactly one file.
2. The root file says in one line that Weaverse maintainers must also read
   `.weaverse/AGENTS.md`, which is absent from scaffolded copies.
3. Add `LICENSE.md` with Pilot's license (MIT) and holder (Weaverse JSC),
   year adapted to 2026.
4. Set `package.json` `version` and `themeSchema.info.version` to `1.0.0`. No
   test asserts the version.
5. After merge (not in this change): tag `v1.0.0` on `main` and publish a
   GitHub Release. Later releases follow semver, bumping both version fields
   together.

## What moved to `.weaverse/AGENTS.md`

- Implement from scratch; the Pilot non-copy policy and Leo's 2026-09-08
  authorization; the static POC as visual reference.
- Storefront completeness defined by the internal productionization spec.
- Build before deployment or demo-integration decisions.
- The Shopify adapter replacing the data source one domain at a time.
- Approval dates for composed browsing, the collection list, blog routes, the
  PDP `main-product` section, the `product-spotlight` exception and the
  `publicEnv` token, plus the retired browse modules.
- The retired legacy stylesheets.
- The guarded Store-operation protocol approval, payment and customer-data
  limits, and "never add a `.env` file to a repository or worktree".
- The fresh root commit and legacy rollback bundle.

## Files touched

- `AGENTS.md`
- `.weaverse/AGENTS.md` (new)
- `LICENSE.md` (new)
- `.env.example` (empty `PUBLIC_STOREFRONT_ORIGIN`, current catalog and Studio-token notes)
- `package.json`
- `src/lib/weaverse/theme-schema.ts`
- `.weaverse/specs/2026-10-15--public-agents-license-1-0/` (this spec)
