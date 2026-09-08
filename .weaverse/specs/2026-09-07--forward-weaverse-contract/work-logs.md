# Work Logs

## 2026-09-07 — @hta218

- Starting SHA: `3972c8dc` (`main`, after Weaverse/forward#64). Branch
  `feat/forward-weaverse-contract` created from it.
- The connection gate was confirmed open in session. builder#2660's body still
  carried the older "do not begin connection work yet" wording; that
  contradiction and the Shared Contract version disagreement (`0.12-draft` in
  #2660 versus `0.14-accepted` in epic #2663) were raised on #2660 rather than
  resolved unilaterally.
- Verified live registry state before writing the contract: `@weaverse/next`
  dist-tag `alpha` resolves to `0.1.0-alpha.16`; `latest` is still the stale
  `0.1.0-alpha.0`. Updated epic #2663 and issue #2660, both of which still
  described `alpha.15` as current and told readers not to claim `alpha.16`
  before registry verification.
- Confirmed Forward's current Weaverse state directly from the tree rather than
  from the issues: `package.json` carries no `@weaverse/next` dependency,
  `.weaverse/` holds only `specs/`, and there is no Weaverse config or project
  connection.
- Derived the section inventory from Forward's real page composition at
  `main@3972c8d`, not from Pilot or the Next POC. The seven `INDEX` sections are
  named from the headings the page actually renders today ("Forward / Field
  equipment 2026", "New field rotation", "Shop by system", the product
  spotlight, "Material standard", "One-day kit", "Repair, not replace" with
  "Latest field note").
- Recorded the cache plan from the route directives already in the tree
  (`revalidate = 3600` on `/`, PDP and collection; `dynamicParams = false` on
  four dynamic routes; `force-dynamic` + `force-no-store` on cart, account, and
  the two account/cart route handlers) so published-mode behavior is preserved
  rather than redesigned.
- Two ownership decisions were made deliberately and are argued in the spec
  rather than assumed: the Header/Footer stay theme-owned in this slice because
  their keyboard, focus-trap, inert, body-lock, and fail-soft contracts would
  otherwise sit behind merchant-editable data with no coverage for the failure
  modes; and the PDP buy block plus the collection grid stay theme-owned
  because they own variant identity, URL query state, and the checkout handoff.
- No dependency was installed, no Weaverse project created, no Studio
  composition started, and no production code, test, or configuration changed.
  This slice is documentation-only.

## 2026-09-08 — @hta218

- Leo resolved two of the three open questions in session:
  1. Header and Footer are **never** Weaverse global sections. They stay
     theme-owned components configured through theme settings — the same
     ownership split the shipped Weaverse Hydrogen starter uses. Recorded as a
     permanent decision, not a deferred slice.
  2. Studio owns the **content** of `/about`, `/materials`, `/field-testing`,
     not just their layout. Copy and imagery become section settings; the three
     routes stay in the repo as thin `PAGE` shells and none is converted into a
     Shopify page.
- Rewrote the theme-settings surface accordingly. It is no longer the flat six
  `ThemeContent` fields but Header / Footer / editorial-imagery groups, each
  entry derived from what Forward renders today: `announcement`, the Shopify
  `main-menu` handle, the wordmark, and country-selector visibility for the
  Header; `footerTagline`, `footerStatus`, `demoNotice`, and the footer menu
  handle for the Footer. `homeHeroImage` and `standardBandImage` stay theme
  settings only until `INDEX` composition moves them onto `hero` and
  `material-standard`.
- The ownership pattern was taken from the shipped Weaverse settings model, not
  from reading Pilot source. `AGENTS.md`'s no-Pilot constraint is unchanged and
  no Pilot code was inspected, copied, or ported.
- Leo waived open question 3: the Shared Contract version disagreement
  (`0.12-draft` in builder#2660 versus `0.14-accepted` in epic #2663) is a
  stale citation, not a scope difference, and does not bound this registry.
  All three open questions are now closed, so the contract is ready for review.
- Still documentation-only: no dependency, project connection, Studio
  composition, or production code change.

## 2026-09-08 (later) — @hta218

- Leo directed extracting every section out of every page before installing
  `@weaverse/next`, so the connection slice has no dependency and no
  credentials blocking it. Done as pure refactor: 35 section components under
  `src/sections/`, each imported back into its route.
- **The inventory in `plan.md` was wrong where it claimed shared sections, and
  contact with the real markup corrected it.** `editorial-hero` was recorded as
  used by all three editorial routes; About and Materials do share it (image
  side differs), but Field Testing's hero is a full-bleed overlay with an
  absolute image and an `after:` scrim — a different section entirely, now
  `editorial-overlay-hero`.
- Reuse the inventory did **not** predict, found in the code:
  - `editorial-callout` — Materials and Field Testing close with byte-identical
    markup.
  - `index-header` — Shop, Journal, and the policy routes all repeated the same
    dark masthead.
  - `search-empty-state` — the no-query and no-match states were the same block
    twice.
  - `rich-text-paragraph` — the policy route had reimplemented the normalized
    run renderer inline.
- Sections are pure presentation: every piece of content and data arrives as
  props, pages keep the `storefront` reads. Weaverse settings map onto props
  one-for-one when the schema lands, so no section needs reshaping then.
- `PRODUCT` and `COLLECTION` kept their contract boundaries: the buy block, the
  variant/query state, and the grid behavior stayed theme-owned and were not
  extracted.
- `/cart` and `/account/**` were left alone. Cart already delegates entirely to
  `CartView`/`ShopifyCartView`, and the account routes have no page-level
  sections — only small cards inside `AccountShell`. Both are theme-owned and
  never Weaverse-composed, so manufacturing sections there would contradict the
  contract.
- Line count, measured per directory so the number is not read as a repo-wide
  shrink: the 12 route files lost 1117 lines net (337 added, 1454 removed),
  while `src/sections/` added 1963 across 35 new files. `src/` therefore grew
  by 955 lines net. Markup moved out of the routes; the growth is the
  per-section imports, prop interfaces, and exports that extraction buys.
- One source-regex assertion in `tests/shopify-content-adapter.test.ts` pointed
  at the article route for `<RichTextRuns runs={block.runs} />`; repointed to
  `src/sections/article-body.tsx`, where that markup now lives.
- Gates: typecheck, lint, format:check, 338/338 node tests, `check:graphql`,
  42-page build, `check:theme`, `check:routes` (20 + 4), and
  `smoke:routes` (35 checks) all pass. The DOM suite's 25 failures are
  identical before and after the refactor — local Bun is 1.3.6 against the
  repo's pinned 1.3.14, which breaks `--path-ignore-patterns` and
  `@testing-library`'s fake-timer detection. Not caused by this work, but the
  DOM suite cannot be trusted locally until Bun matches.

## 2026-09-08 (close-out) — @hta218

- Updated `AGENTS.md` now that the extraction has landed and the connection
  gate is open:
  - Weaverse moved from "outside that approval" into the approved set for the
    current ordered slices, with its own guardrails alongside: install only an
    exact registry-verified version, never the stale npm `latest`; keep the
    Shopify data seam and the Weaverse composition seam separate so no
    credential, private token, or raw payload reaches a Studio payload; and
    leave pageview transport and deduplication to the SDK.
  - Added the section rule: routes compose named sections from `src/sections/`,
    a section is pure presentation taking content and data as props, sections
    never import the data source, and a section reused by more than one route
    takes its variations as props rather than forking into a near-copy.
  - Recorded which surfaces are not sections and stay theme-owned: the PDP buy
    block and its `colorway`/`size` query state, the collection and Shop grid
    behavior, Cart, `/account/**`, and Header/Footer.
  - Clarified the no-Pilot constraint rather than weakening it. Adopting a
    documented Weaverse platform pattern is a platform decision, not Pilot
    emulation, and still does not license reading Pilot source.
  - Corrected the verification list from `bun test` to `bun run test`; the bare
    form skips the DOM suite's preload. Pinned the Bun expectation to
    `packageManager` and explained the failure mode an older Bun produces, so
    the next agent does not chase 25 phantom failures.
- `README.md`: recorded the post-extraction state beside the original baseline,
  put extraction into the spec's Included scope with the reason it moved ahead
  of the install, excluded schema/registry/seam work explicitly, and renumbered
  the phase gates — Phase 2 is now the completed extraction and the connection
  slice became Phase 4.
- `plan.md`: rewrote the inventory to match the shipped components rather than
  the paper model, and added a "What extraction corrected" section so the three
  disagreements are recorded rather than quietly patched — `editorial-hero` was
  not shared by all three editorial routes, four kinds of reuse were missed, and
  the per-role section counts were wrong (`COLLECTION` four not three, `PRODUCT`
  one not five, `ARTICLE` two not three). Also documented the theme-owned routes
  that were extracted for code organization without becoming composable, and
  reordered the implementation steps so extraction sits before the install.
- No section was invented to match the table. `article-related` stayed out
  because the route does not render it, and the four PDP disclosure panels
  stayed inside the buy block because they are one stack, not four sections.

## 2026-09-08 (verification follow-up) — @hta218

- Re-ran the gates on `8a7a749` from the primary checkout, where Bun matches
  the pinned `1.3.14` line (local `1.4.2`).
- **The DOM suite is fine.** It passes `66/66` here, so the 25 failures logged
  above were entirely the older local Bun and not a regression. The pinned-Bun
  warning in `AGENTS.md` stays useful, but nothing in the extraction broke the
  DOM layer.
- Ran `bun run test:browser:static`, which the extraction entry did not cover:
  `146 passed / 10 intentional skips / 0 failures` across desktop, short
  desktop, and true mobile against a fresh production build. This is the
  evidence for "extraction moved markup without changing rendered output" —
  a 1454-line markup move across 12 routes is exactly what the browser matrix
  exists to check, and JSDOM cannot prove it.
- Verified the two new `AGENTS.md` section rules against the tree rather than
  trusting the log: no file in `src/sections/` imports the storefront data
  source or a fixture, and every section is a Server Component.
- `bun run check` passed in full: `338/338` node, `66/66` DOM, GraphQL,
  42-page build, compiled theme, route contract `20 + 4`.

## 2026-09-08 (Phase 4 start) — @hta218

- Leo approved Phase 3 and directed that Phase 4 continue in this spec rather
  than a follow-up folder. The Weaverse project already exists, so the
  environment is a fill-in rather than a creation step.
- Added `.env.example`. `.gitignore` already carried `!.env.example`, so the
  template is tracked while every real `.env*` stays ignored.
- **Source note.** The request was to reference Pilot. `AGENTS.md` forbids
  inspecting Pilot, and the 2026-09-08 clarification is explicit that adopting
  a Weaverse platform pattern "does not license reading Pilot source". Pilot is
  also the wrong reference here: it is a Hydrogen theme on
  `@weaverse/hydrogen`, while Forward is Next on `@weaverse/next`. The template
  was instead derived from Forward's own env modules
  (`src/lib/storefront/shopify/env.ts`, `src/lib/account/env.ts`), the
  `@weaverse/next` source in the SDK monorepo, and the Next POC — the last of
  which this spec already names as permitted reference evidence. No Pilot
  source was read.
- The template documents the fail-closed semantics each group already has:
  the Shopify catalog pair is both-or-neither, the Customer Account tuple is
  all-or-none, and a partial group raises a sanitized error naming only keys.
- **Security finding recorded in the template.** `@weaverse/next` builds a
  `publicEnv` payload from `PUBLIC_STORE_DOMAIN` and
  `PUBLIC_STOREFRONT_API_TOKEN`, so once composition is wired the public token
  would reach the browser. `AGENTS.md` places public-token browser use outside
  the current approval, so `PUBLIC_STOREFRONT_API_TOKEN` is documented as a
  deliberate decision rather than a default. Both keys remain unread by the
  storefront today; only the opt-in verification scripts consume them.
- Key coverage checked against the real local `.env`: every key it holds is
  present in the template. The template adds `PUBLIC_MAIN_MENU_HANDLE`, which
  is optional and defaults to `main-menu`, and the three Weaverse keys.
- No dependency installed and no composition wired yet.

## 2026-09-08 (POC reference pass) — @hta218

- Leo redirected the reference from Pilot to `weaverse-hydrogen-next-poc`,
  which this spec already lists as permitted evidence. Read the POC's
  `package.json`, `app/weaverse-next/server.ts`, and `.env.example`.
- **Install shape corrected.** The POC lists four Weaverse packages
  (`core`, `next`, `react`, `schema`), which reads like four are required.
  Checking the registry instead: `@weaverse/next@0.1.0-alpha.16` already
  depends on `@weaverse/react@5.16.4` and `@weaverse/schema@0.10.0`. Forward
  installs `@weaverse/next` alone and lets the rest arrive transitively. Peers
  `next >=14`, `react >=19`, `react-dom >=19` are satisfied by Forward's Next
  `16.3.0` and React `19.2.8`. The POC pins `@weaverse/next@0.1.0-alpha.15`,
  one behind the current `alpha` tag.
- **A design decision came out of the POC rather than a copy of it.** Its
  `createWeaverseServerClientFromContext` passes `env: process.env` wholesale,
  and the SDK builds its browser-visible `publicEnv` from `PUBLIC_STORE_DOMAIN`
  and `PUBLIC_STOREFRONT_API_TOKEN`. Handing the SDK the whole environment is
  the mechanism by which a token reaches the client. Forward will pass an
  explicit allowlisted object instead, so nothing reaches a Studio payload by
  default and `PRIVATE_STOREFRONT_API_TOKEN` cannot be exposed by a later SDK
  change. Recorded in `plan.md` step 5.
- Confirmed the env template already matches what theme code actually reads:
  the POC reads only `WEAVERSE_PROJECT_ID` and `WEAVERSE_HOST` directly, and
  `WEAVERSE_API_KEY` is consumed inside the SDK. It also guards against its own
  `REPLACE_ME` placeholder; Forward's template uses empty values, which the
  same required-check rejects without a sentinel string.
- Cache note: the POC sets `{ revalidate: 60 }` with invalidation tags on the
  SDK client while design/revision-preview reads are forced `no-store` by the
  SDK. Forward's route-level `revalidate = 3600` exports stay as the contract
  records them; the SDK cache config is a separate knob and must not silently
  override the route contract.
- No Pilot source was read at any point. Still no dependency installed and no
  composition wired.

## 2026-09-08 (env template correction) — @hta218

- Leo corrected the `WEAVERSE_API_KEY` entry: it is not a storefront runtime
  input at all. It belongs to a local script that seeds admin data, so it has
  no place in the theme's environment template. Removed from `.env.example`,
  and the claim in `plan.md` that the SDK reads it was corrected.
- The earlier note was inferred from the SDK reading the key into its config
  object. Tracing it further showed the value is never consumed — no request
  header, no fetch, no auth path — which was consistent with Leo's correction
  rather than contradicting it, but the template had already been written as
  though the key mattered to the theme.
- Also recorded that `WEAVERSE_HOST` is not a cosmetic Studio URL: an explicit
  non-default value moves the SDK's API base off the production edge proxy, so
  it is a staging/self-hosted switch. Left empty for production.
- `WEAVERSE_PUBLIC_API_BASE` remains deliberately absent from the template for
  the same reason: self-hosted deployments only.

## 2026-09-08 (Phase 4 connection slice) — @hta218

- Registry verified at install time: `alpha` resolved to `0.1.0-alpha.16`,
  `latest` still the stale `0.1.0-alpha.0`. Installed `@weaverse/next` alone
  and pinned it exactly; `@weaverse/react` and `@weaverse/schema` arrived
  transitively as predicted. Dependency committed on its own with the gates and
  a clean 71-package production audit proving it inert before any composition.
- **The env allowlist plan was wrong and the SDK source corrected it.** The
  contract said to hand the SDK an explicit object instead of `process.env`.
  Reading `readEnv` showed that is not enough: it falls back to
  `process.env[key]` whenever a key is *absent* from the object it was given,
  so a short allowlist blocks nothing. Only a key present with a defined value
  short-circuits the fallback. `src/lib/weaverse/env.ts` therefore names all six
  keys the SDK reads and supplies each one, blanking
  `PUBLIC_STOREFRONT_API_TOKEN`, `WEAVERSE_API_KEY`, and
  `WEAVERSE_PUBLIC_API_BASE`. That is the same explicit-empty discipline
  `scripts/env-matrix.mts` already uses.
- A test asserts the key list against the installed SDK bundle, so a new SDK
  env key fails the suite instead of silently falling through to `process.env`.
  Sabotage-proven: removing one key from the list produced exactly that failure.
- The seam fails soft everywhere. An unconfigured project, a network error, a
  missing page, or the Builder's fallback placeholder all yield `null` and the
  route keeps its theme-owned rendering, so composition can never turn a
  working page into an error page.
- 17 section schemas and the component registry landed in `src/lib/weaverse/`
  rather than inside `src/sections/`, keeping section files pure presentation
  per `AGENTS.md` and schema code out of route bundles. Every input maps to a
  prop the shipped section already takes; data-shaped props stay selectors.
  Header, Footer, the buy block, grid behavior, Cart, account, and the
  theme-owned route sections are deliberately absent from the registry.
- Seed data transcribed from the live routes into `scripts/weaverse-seed/`:
  `INDEX` (7 sections), `/about`, `/materials`, `/field-testing` (4 each), plus
  theme settings. `bun run seed:weaverse` is a dry run; `--apply` writes and is
  the only path that reads `WEAVERSE_API_KEY`. Section types are validated
  against the registry before the first request and item ids are a
  deterministic digest, so re-running merges instead of duplicating. Validation
  sabotage-proven against an unregistered type and a duplicate key.
- The Content API shape came from `docs/content-api/`, not from guesswork:
  `PATCH /api/v1/content/projects/:id/pages/:type/:handle` with
  `{ items: [{ id, type, data, children }] }`, and
  `PATCH .../theme-settings` with `{ theme }`.
- Gates after each slice: `bun run check` green throughout, ending at `350`
  node + `66` DOM tests. No composition is wired into any route yet, so the
  storefront renders exactly as before.
