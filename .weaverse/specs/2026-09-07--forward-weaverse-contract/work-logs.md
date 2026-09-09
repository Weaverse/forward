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

## 2026-09-08 (schema reorganization) — @hta218

- Leo rejected the first schema layout and authorized reading Pilot for file
  organization only. `AGENTS.md` had a blanket prohibition, so it was rewritten
  to record the exception and its limit rather than leaving a documented
  constraint quietly contradicted: layout conventions may be adopted,
  implementation may not, and nothing here is a translation of Pilot source.
- Three organizational patterns adopted:
  1. **Schema beside component.** `src/lib/weaverse/schemas.ts` was a
     monolith 17 sections away from the markup it described. Each `schema` now
     lives in its section's own file, so settings and markup cannot drift.
     Pilot pairs this with `export default` and `import * as`; Forward keeps
     named exports per its own rule, and the registry pairs the module's schema
     with the named component instead.
  2. **Theme settings per group.** `settings/header.ts`, `settings/footer.ts`,
     `settings/editorial-imagery.ts`, each `as const satisfies
     WeaverseNextThemeSchemaGroup`, composed in `theme-schema.ts`.
  3. **Derived types.** `settings/types.ts` walks the input tuples and produces
     `HeaderSettings`, `FooterSettings`, `EditorialImagerySettings`, and the
     combined `ThemeSettings`. Because the types come from the same
     declarations Builder renders, renaming an input breaks its consumers at
     compile time instead of silently reading `undefined`.
- Added `Heading`, `Subheading`, `Paragraph`, and `Button` as shared Weaverse
  elements. They render through the existing `sectionHeading`, `eyebrow`, and
  `cta` recipes, so Studio-authored copy and route-authored copy are the same
  pixels rather than a lookalike. `Heading` keeps level (`as`) separate from
  size because heading level is document structure, not appearance, and
  `Button` is always a link since every authored CTA navigates.
- The registry now holds 21 entries: 4 shared elements plus the 17 sections.
- Gates after the reorganization: `bun run check` green at `350` node + `66`
  DOM, 42-page build, route contract `20 + 4`. The seed dry run still validates
  every seeded section type against the registry.

## 2026-09-08 (export convention) — @hta218

- Corrected a misattribution: the "named exports only" rule is Leo's global
  convention, not anything `AGENTS.md` states, and it carries an explicit
  "except must-use cases like Route components" clause. The Weaverse registry
  reading `default` off a module is exactly such a case, so the Pilot pattern
  was never in tension with the rule and the earlier workaround was unnecessary.
- Switched the 21 registered components — 17 sections and the 4 shared
  elements — to `export default`, and the registry to `import * as` with
  single-argument entries. `entry()` no longer takes the component separately,
  so a schema can no longer be paired with the wrong component by hand.
- Scope was deliberate rather than blanket: the other 18 sections
  (`index-header`, `journal-*`, `product-results`, `search-*`,
  `policy-document`, `collection-grid`, and the rest) are not Weaverse
  components, have no platform requirement for a default export, and keep
  named exports. Default exports outside `src/app/` now number exactly 21 —
  one per registry entry.
- Four route files moved to default imports. Gates stayed green: `bun run
  check` at `350` node + `66` DOM, 42-page build, route contract `20 + 4`.

## 2026-09-08 (composition slice) — @hta218

- **Resource pickers replace handle textareas.** Builder stores `{ id, handle }`
  only; per-section server loaders resolve those handles through the
  `storefront` data source. The POC queries `commerce.storefront` GraphQL
  directly, which Forward deliberately does not copy: that would open a second
  Shopify seam, return raw shapes, and break static mode. `pickerHandle`
  tolerates a cleared or malformed value, and an unresolvable handle degrades to
  the section's empty state rather than a failed page.
- **Scope narrowed from the paper plan, and the reason is measurable.** Only the
  ten editorial sections are composable. Home's seven stay Server Components:
  composing them would ship their JavaScript to the browser on the
  highest-traffic page and buy nothing a shopper can see. Their schemas and
  default exports were reverted rather than left registered-but-unused, and
  `scripts/weaverse-seed/index.json` was deleted for the same reason — seeding a
  page nothing renders is a lie in the data.
- **Two registries, forced by Next rather than chosen.** The renderer is a
  Client Component and cannot import Server Components, so `components.ts` is
  the client registry and `server-components.ts` carries schemas plus loaders.
  Schemas moved into their own `schema.ts` beside each component so the server
  registry never reaches a Client Component module. `section-types.ts` derives
  the type list from schemas alone, with no server or client dependency, so the
  seed script can import it outside Next.
- **`@weaverse/next@0.1.0-alpha.16` cannot render server-side.** Its renderer
  holds context and subscribes to a store, its README documents only the
  `"use client"` boundary, and `provider.d.ts` states the payload is "not
  serializable across a Server Component → Client Component boundary". The
  POC's `() => null` stub is the shape of that constraint, not a shortcut.
  Revisit this whole split if the SDK gains server rendering.
- **Composition makes a route dynamic**, because `headers()` opts a route out of
  static generation. Verified both directions: with a project configured
  `/about`, `/materials`, `/field-testing` build as `ƒ`; with the project blank
  they build as `○` exactly as before. `readWeaverseConfig` runs before
  `headers()`, which is what keeps the unconfigured path static.
- **A real regression, found by the browser matrix and fixed at the cause.**
  The first run dropped to `140 passed / 6 failed` and took 7.6 minutes, all six
  failures on the editorial routes. Cause: `scripts/env-matrix.mts` never
  blanked the Weaverse keys, so the "static" matrix still had a live project,
  turned those routes dynamic, and called the Weaverse API on every request.
  Added `WEAVERSE_KEYS` to `ALL_CREDENTIAL_KEYS`; the matrix returned to
  `146 passed / 10 intentional skips / 0 failures` in 1.5 minutes. The matrix
  earned its keep here — no other gate caught this.
- `tests/weaverse-registry.test.ts` asserts the split holds: the client registry
  never imports `server-only`, the server registry never imports a component
  module, both sides carry the same type count, no type is declared twice, and
  no loader reaches Shopify outside the data source. Two of its own regexes were
  wrong on the first run and were fixed before the suite was trusted.
- Production bundle scan: `.next/static` contains zero references to
  `getThemeContent`, `listProducts`, `PRIVATE_STOREFRONT`, `resolveProducts`, or
  `server-only`.
- Gates: `bun run check` green at `354` node + `66` DOM, 42-page build, route
  contract `20 + 4`, 35 route smokes, and the static browser matrix at
  `146 / 10 / 0`.

## 2026-09-08 (three defects found by questioning the live API) — @hta218

Leo asked whether the routes were actually reading Weaverse yet. Answering that
honestly meant calling the live API instead of trusting the code, and it exposed
three defects the whole gate suite had missed.

1. **Wrong page type.** `/about`, `/materials`, `/field-testing` were requested
   as `PAGE`. In Weaverse `PAGE` is a Shopify page — that is
   `/pages/[pageHandle]`. A theme-owned route at its own path is `CUSTOM`.
   Proven against the live API: `PAGE/about` returns the project's shared
   *"Default regular page"* with an empty handle, while `CUSTOM/about` returns
   the assignment for `about`. Corrected in the three routes, the three seed
   payloads, and the contract table.
2. **Empty-page detection never fired.** The filter matched `page.id` containing
   `"fallback"`, copied from the POC without checking it applied here. A real
   default template arrives with an ordinary cuid and a single childless root,
   so the filter passed it through and the three routes would have rendered an
   empty Weaverse page instead of their static fallback. Now judged by content:
   a page with no authored child sections is "not composed yet", whichever way
   the Builder expresses it.
3. **The request context had no pathname.** `resolveRequestUrl` falls back to
   `"/"` when the context supplies neither `url` nor `pathname`, so every
   `CUSTOM` lookup would have resolved against the home page. `pathname` is now
   a required field on `LoadWeaversePageOptions` rather than an optional one,
   because forgetting it fails silently rather than loudly.

**Why every gate missed all three.** `bun run check` and the browser matrices
run with the Weaverse keys blanked, so they only ever exercise the static
branch. The seed script had only been dry-run, and a dry run validates section
types against the registry without touching the API. Nothing in the suite ever
compared an assumption against the live system.

**Also corrected: the seed script could not have worked.** It only sent `PATCH`,
but the Content API separates creation (`POST .../pages`) from content update
(`PATCH .../pages/:type/:handle`), and a project that has never been seeded has
neither page. It now creates first and treats `409` as "already exists", which
is the ordinary second-run case.

**Scope recorded honestly.** `/pages/[pageHandle]` and `/journal/[articleHandle]`
remain unwired. Both carry Shopify-owned bodies, so composition there owns
chrome around verbatim content — a different problem from the theme-owned
editorial routes, and its own slice. The contract table now says so instead of
implying all `PAGE` routes are composed.

Verified after the fixes: `CUSTOM` lookups for all three routes return no page,
so the routes take their static fallback. `bun run check` green at `354` node +
`66` DOM, and with the project blank the three routes still build as `○` static.

## 2026-09-08 (first real seed) — @hta218

- Seeded the three `CUSTOM` pages only. Theme settings were deliberately left
  out and now need `--with-theme`: nothing in the storefront reads them yet —
  the Footer still takes its copy from the storefront data source — so writing
  them would put values in Studio that a merchant can edit to no visible
  effect. That is the same "data that lies" problem that removed `index.json`.
- **The first apply reported success and produced empty pages.** Both requests
  returned ok, but the public API still rendered one childless item. Cause: the
  Builder creates a page with its own root (`main`), and the script invented a
  deterministic `root` id of its own. The page kept pointing at the original
  root, which had no children, so the Content API showed four sections present
  while the storefront showed nothing. The script now reads the page's real
  root id and attaches the sections to it.
- That defect is only visible by comparing two sources: the Content API showed
  six items and looked correct, the public render showed one. Exit codes agreed
  with neither.
- End-to-end verification on a production build: `/about` returns 77,933 bytes
  containing the seeded heading and all four sections, and `product-strip`
  renders Weatherline, Traverse, and Drift — so the resource picker, the server
  loader, and the storefront data source resolve a handle to a real product.
  `/materials` and `/field-testing` both return 200 with product references.
- Live page state: `CUSTOM` pages `about`, `materials`, `field-testing`, each
  five items with four sections under the Builder's own root.

## 2026-09-08 (composed pages crashed; fixed at the class, not the instance) — @hta218

- Leo opened `/about` and got "An unexpected error interrupted this page":
  `EditorialHero` read `.src` of `undefined`. Two defects, one root cause.
- **Shape mismatch.** Builder stores an image as `{ url, altText, width,
  height }`; the theme renders `StorefrontImage` (`{ src, alt, width,
  height }`). The two look interchangeable and are not, so `.src` was
  `undefined` and `next/image` threw. Added `weaverseImage()` to normalize
  either shape, or return `null` when the value is unusable — including a
  Builder image with no dimensions, which `next/image` also rejects.
- **The seeded data had no image at all.** The three payloads carried copy but
  never the `image` setting the schema declares, so even a correct shape would
  have rendered nothing. Images added and reseeded.
- **The root cause is broader than images.** A composed section is fed
  merchant-editable data, and a merchant can clear any field in Studio, so
  "every setting missing" is an ordinary state — the same fail-soft contract
  the Header already carries. I made ten sections composable without auditing
  their required props, which is the actual mistake; the image crash was just
  the first symptom to surface.
- Fixed at that level: `tests/dom/composed-sections.test.tsx` renders all
  fourteen composed components — the ten sections and the four shared elements —
  with no props at all, plus two cases for Builder's image shape and a
  dimensionless image. Sabotage-proven: restoring the unnormalized read turns
  three of them red, exactly the failure Leo hit.
- The audit found only the two hero sections actually crashed. The list-shaped
  sections were already safe because `parseLines`/`parseRows` reject non-strings,
  and the three product sections already defaulted their `loaderData`. That is
  luck rather than design, which is why the test now covers all fourteen.
- Verified on a production build at the exact URL that failed: `/about`,
  `/materials`, and `/field-testing` all return 200 with an editorial image and
  no error page. Gates green at `354` node + `82` DOM.

## 2026-09-08 (Studio could not connect) — @hta218

Leo opened the project in Studio and it would not connect or show a page
outline. Four separate gaps, each of which alone breaks the bridge.

1. **`StudioConnect` was in `<head>`.** It is a Client Component and belongs in
   `<body>`, where the POC mounts it.
2. **Routes never forwarded `searchParams`.** Design mode is detected from the
   query Studio puts on the iframe URL, so without them the SDK resolved
   published mode and returned no schema.
3. **The client had no request context.** `createWeaverseNextClient` was given
   only components and a project id, so the bridge had no route identity to
   attach to. `clientRequestContext()` now rebuilds it from
   `configs.requestInfo`, the way the POC does.
4. **Components dropped the runtime identity props.** The Weaverse runtime
   passes `data-wv-id` / `data-wv-type` as props, and a component must spread
   them onto its root element. None of the fourteen did, so only the root
   `main` carried an id: the page rendered perfectly and Studio saw one
   selectable item instead of five. This is the failure mode worth remembering
   — **the storefront looks completely correct while the theme is unusable in
   Studio**, so no storefront-facing check can catch it.
- Added `WeaverseElementProps` and `elementAttributes()`, which forward only the
  identity attributes rather than the whole prop bag, since the bag also carries
  authored settings that are not DOM attributes.
- Measured before and after on a real design-mode request: `data-wv-id` went
  from `1` to `5` per page, with the expected types — `main` plus the four
  sections, on all three routes.
- **A real conflict surfaced while guarding this.** `product-case-study`
  returned `null` when no product resolved, which is right on the storefront and
  wrong in Studio: an item that renders nothing cannot be selected, so a
  merchant could never reach it to choose a product. It now renders a selectable
  placeholder when the runtime is rendering it — detected by the identity
  attributes being present — and still renders nothing when a route calls it
  directly. Pilot solves the same problem with a dedicated placeholder file.
- `tests/dom/composed-sections.test.tsx` now also asserts every composed
  component forwards the identity attributes onto its root element. That guard
  is what caught the case-study conflict rather than shipping it.
- Gates: `bun run check` green at `354` node + `96` DOM, and the static browser
  matrix at `146 / 10 / 0`.

## 2026-09-08 (POC parity audit) — @hta218

Leo's correction: follow the POC rather than deriving from it. The four Studio
bugs above were all things the POC already had right, and reading it in
fragments instead of comparing it whole is what produced them. Did the
comparison properly.

- **Missing: the per-item revalidation route.** `app/api/weaverse/revalidate`
  exists in the POC and had no counterpart here. Without it a merchant editing a
  section — especially changing a resource selection — sees stale data until a
  full reload, because a component loader otherwise only runs during a page
  load. Added with `createWeaverseNextRevalidateHandler`, plus
  `revalidateServerClient()` which uses the handler's validated request context
  when present and falls back to a bare client for older Studio bridges.
  Verified live: an empty body returns `400 invalid-payload`, so the handler is
  mounted and validating.
- **Project id now comes from the payload**, as in the POC, falling back to the
  environment. Studio targets the project the payload was loaded with; taking it
  from the environment instead would point the bridge at a different project
  whenever the two disagree.
- Deliberately still absent, both deferred with theme settings under option A:
  `root-provider.tsx` and `theme-settings-css-variables.tsx`. Nothing reads
  theme settings yet, so adding the provider now would wire a store with no
  consumer. They land in the slice that wires the Header and Footer.
- Remaining POC files with no counterpart are its own fixtures and tests
  (`slideshow-schema`, `resource-picker-smoke`, and their suites), which are
  spike material rather than starter code.

## 2026-09-08 (Studio bridge crashed on an incomplete request context) — @hta218

Studio loaded but its runtime threw twice: `reading 'pageId' of undefined` in
`refreshStudio`, and `reading 'language' of undefined` from its
project-not-found bundle.

- **Cause: the server request context was missing four fields.** The POC's
  `buildWeaverseNextPageRequestContext` supplies `url`, `i18n`, `pageType`, and
  `handle`; this seam supplied only `headers`, `pathname`, and `searchParams`.
  Those four travel to the client in `configs.requestInfo`, so the bridge read
  `i18n.language` off `undefined` and had no page identity to refresh.
- `i18n` reuses `CATALOG_I18N` from the Shopify client rather than declaring a
  second market table — markets are a deferred slice and one source of truth is
  enough. It is now exported instead of file-local.
- `url` is built from the forwarded host so it matches the deployed preview.
  `resolveRequestUrl` prefers `url` over `pathname`, and a bare pathname
  resolves against `http://localhost`, which never matches a real preview.
- Verified on a design-mode request that the payload now carries
  `requestInfo: { pathname: "/about", search, i18n: { country: "US", language:
  "EN", locale: "en-us" }, pageType: "CUSTOM", handle: "about" }`.
- The pattern across today's Studio failures is consistent: everything the
  storefront needs was already right, and every break was a field the *bridge*
  needs that the storefront never reads. Storefront-facing checks cannot see
  any of them, which is the argument for a design-mode gate.

## 2026-09-08 (Studio confirmed working end to end) — @hta218

Leo confirmed the full loop in Studio: sections can be selected, edited, saved,
and the change survives a reload. That is the first evidence the whole chain
works together — seed → server loader → resource picker → storefront data
source → client render → Studio bridge → save → publish.

State at this point:

- Composed and working: `/about`, `/materials`, `/field-testing` as `CUSTOM`
  pages, ten sections plus four shared elements registered.
- Not composed, recorded in the contract: `/pages/[pageHandle]` (`PAGE`),
  `/journal/[articleHandle]` (`ARTICLE`), and Home's seven sections, which stay
  Server Components deliberately.
- Theme settings seeded nowhere and read nowhere; Header and Footer still take
  their copy from the storefront data source.

**The open risk is unchanged and now well evidenced.** Every Studio defect
found today — wrong page type, empty-page detection, missing pathname, missing
identity attributes, incomplete request context, absent revalidation route —
was invisible to `bun run check`, the browser matrices, and the route smokes,
because each was a field the bridge needs and the storefront never reads. Six
defects, zero caught by automation, all found by Leo opening a page. A
design-mode gate that asserts a real request carries `requestInfo` with `i18n`,
`pageType`, and `handle`, one `data-wv-id` per authored section, and a mounted
Studio script would have caught all six.

## 2026-09-08 (closing the Studio blind spot) — @hta218

Six Studio defects shipped today and none was caught by automation. Rather than
build a heavyweight design-mode gate, the failures were sorted by what actually
catches each one; five of the six turned out to be cheap.

- **Extracted two pure modules from `server.ts`.** `page-payload.ts` owns
  "does this payload have content", `request-info.ts` owns "what is this
  route's identity". Both were previously inline in a file that imports
  `server-only` and calls `headers()`, so neither could be tested outside Next.
  The split is honest rather than test-driven convenience: neither piece of
  logic needs to know anything about a request. `server.ts` dropped to 190
  lines.
- `tests/weaverse-request.test.ts` covers exactly the shipped defects: the
  Builder's shared default template with a childless root (the payload that
  rendered blank), a missing `i18n` (the crash on `i18n.language`), missing
  `pageType`/`handle` (the `pageId` crash), and a bare pathname instead of an
  absolute url. Plus forwarded-host resolution and repeated query values.
- Three guards in `tests/weaverse-registry.test.ts` for the file-level gaps:
  the revalidation route is mounted and exports `POST`, `StudioConnect` renders
  inside `<body>`, and every composed route forwards `searchParams`.
  Sabotage-proven — removing the route, moving the script to `<head>`, and
  dropping one route's `searchParams` turns exactly three red.
- **The revalidation route was deliberately not added to the route contract.**
  That contract tracks no API routes at all — `/api/cart` is absent too — and
  widening it would change the `20 + 4` counts other suites pin. A targeted
  assertion is the smaller change.
- Coverage of today's six: five now caught by `bun run check`. The sixth —
  requesting `PAGE` where the project holds a `CUSTOM` page — can only be
  caught against the live API, and is the case for the opt-in
  `verify:weaverse` script that remains unwritten.
- Gates: `370` node + `96` DOM tests, build, theme, route contract `20 + 4`.

## 2026-09-08 (one route for every custom page) — @hta218

Leo: custom pages belong on one catch-all, not a route file each, and with the
content in Weaverse the static fallbacks can go. Both done, but the route took
three attempts and the docs settled it.

- **`notFound()` cannot set a 404 on a dynamic route, and that is documented.**
  Next's `notFound` reference: "the response has already begun streaming as a
  `200`, and the status can't change once streaming has started... To return a
  real `404` status, the resource has to be checked before the response
  streams... run that check in `proxy` instead." Measured the same thing first
  by experiment — sync call, no custom `not-found.tsx`, minimal layout, dev and
  production, all `200` — which was slower than reading the page. `/zxcx` on
  production returns 404 because Next matches no route at all and never starts
  rendering; that path never reaches `notFound()`.
- **A root-level catch-all is therefore unusable here.** Being dynamic (it needs
  `searchParams` for design mode and `headers()` for the request context) it
  matches every unclaimed URL, and `dynamicParams = false` does not gate a route
  that renders dynamically — verified with a probe where both known and unknown
  params answered `200`. Six route-contract smokes failed as a result.
- **The renderer moved behind an internal prefix**, and the proxy rewrites only
  the paths Weaverse publishes. Everything else keeps ordinary routing, so
  unknown handles still get real 404s. First attempt used `__weaverse`, which
  Next never built: a folder starting with `_` is a private folder and is
  excluded from routing.
- **The proxy runs again on its own rewrite.** The guard that stops a visitor
  addressing the internal prefix was blocking the real rewritten request, so
  two of the three pages 404'd while `/about` happened to pass. Found by logging
  the proxy's own decisions during a smoke run rather than by more reasoning. A
  marker header now separates the two.
- **A fail-open comment that had become false.** While the renderer sat at the
  root, an unlisted path fell through to a soft 404. Behind the prefix it has no
  route at all, so the same code now fails *closed* — an outage would hard-404
  every real custom page. The listing cache now admits every path when it has no
  usable listing and lets the renderer decide.
- Static fallbacks deleted with the three route folders, per Leo: Studio owns
  this content, and future pages will work the same way. Static mode no longer
  serves those three paths, and the contract records them by smoke path against
  the shared renderer.
- Verified: `/about`, `/materials`, `/field-testing` each render with five
  `data-wv-id` items; `/lookbook`, `/weaverse-page/about`, `/products/x`, and
  `/pages/x` all return 404. `bun run check` green at `379` node + `96` DOM, and
  `smoke:routes` back to `35/35`.
- `[locale]` is not part of this: it does not affect the 404 mechanism, and it
  belongs to its own issue since #65 excludes markets and it would touch every
  route file.

## 2026-09-08 (the real cause: a root loading boundary) — @hta218

Leo asked why Pilot answers a real 404 for `/products/x` and Forward did not.
Chasing that question found the actual cause, and it invalidated most of the
architecture built earlier today.

- **Pilot is a different framework, and that was the first clue.** Its route
  `products/:productHandle` matches every handle — React Router has no
  `dynamicParams` — and its loader throws `new Response("product", { status:
  404 })` *before* rendering. Nothing has streamed, so the status is free to
  set. Its root catch-all is safe precisely because specific routes never
  decline a request.
- **The Next POC does the same thing with `notFound()` and still gets 404s.**
  Its product route has no `dynamicParams` and no `generateStaticParams`, yet
  `/products/khong-co-that` answers 404 on the deployed site. That ruled out
  every explanation about catch-alls, app-root position, and locale segments.
- **The difference was `src/app/loading.tsx`.** The POC has none. A root
  `loading.tsx` wraps every route in a Suspense boundary, so Next streams a
  shell and commits the response to `200` before any component runs; from there
  `notFound()` can only be a soft 404. Proven directly: with the file present a
  probe route answered `200`, and with it removed the same probe answered `404`.
- Six routes call `notFound()`. None of them could set a status. They answered
  404 only because `dynamicParams = false` rejects an unknown param before
  rendering starts — which is also why an unknown handle fell through to a root
  catch-all instead of 404ing.
- **Removed the boundary, and most of the day's scaffolding with it.** The
  renderer went back to `src/app/[...slug]`, the invented `/weaverse-page`
  prefix is gone, the proxy is once again only the account boundary, and the
  cached custom-page listing and its nine tests were deleted. Roughly 200 lines
  of machinery existed only to work around a Suspense boundary.
- `[locale]` is not needed for any of this. It remains a markets question for
  its own issue.
- **A test contract broke quietly.** `gotoReady` waited for the loading text to
  disappear, which doubled as a hydration signal; with the boundary gone the
  assertion became vacuous and the mega-panel test started clicking a trigger
  React had not wired yet. Retrying the click until the panel opens fixed it.
  `networkidle` was tried first and rejected: it took the matrix from 1.4 to
  7.4 minutes and still failed.
- Static-matrix browser coverage for `/about`, `/materials`, and
  `/field-testing` was removed rather than faked, since those pages no longer
  exist without a Weaverse project. **Open gap:** no matrix configures Weaverse,
  so composed pages have no browser coverage at all.
- Verified: the three custom pages render with five `data-wv-id` items each;
  `/lookbook`, `/nothing/here`, and unknown product, collection, article, page,
  and policy handles all answer 404; every real route still answers 200.
  `bun run check` green at `370` node + `95` DOM, `smoke:routes` `35/35`, and
  the static browser matrix back to `146 / 10 / 0` in under a minute.

## 2026-09-08 — Composing the remaining page types (#67)

Branch `feat/weaverse-page-types` from `main@0c84182`.

- **The `dataContext` seam.** `CUSTOM` sections pick their own resource; a
  resource-backed template does not — the route decides which product,
  collection, page, or article it is rendering. That data now travels through
  one React context: `WeaversePage` supplies it around the renderer, and a
  route supplies it around its own fallback, so the same component runs
  composed or not. Reading it off `useWeaverse()` alone would have made every
  fallback render nothing.
- **All five templates composed.** `INDEX` (7 sections), `PRODUCT` (1, around
  the theme-owned buy block), `COLLECTION` (4), `PAGE` (4), `ARTICLE` (2).
  Eleven sections became folder sections with schemas; all are registered in
  both registries and in `section-types.ts`.
- **A silent break, found by looking at the rendered HTML.** `loadWeaversePage`
  imported `hasAuthoredSections` and never called it, so the Builder's empty
  default template was treated as a composed page. Home, the PDP, the
  collection, the article, and the Shopify page all rendered blank while every
  status check passed. The guard is applied now, and skipped in design mode
  where an empty page is precisely what the merchant is about to compose.
  `smoke:routes` now fails a 200 HTML route that renders no `<h1>`; disabling
  the guard and rebuilding was used to confirm the assertion actually fires.
- **The composed-section DOM suite was a hand-kept list**, so eleven new
  sections would have shipped with no render and no Studio-addressability
  assertion. It is now derived from `WEAVERSE_COMPONENTS`, and the identity
  assertions render inside a populated route context. 95 → 131 DOM tests.
- **`presets` and `enabledOn` on every section.** Preset copy is the theme's
  own defaults, so an added section looks like the shipped page. `home-hero`
  also gained the `stats` input it renders but never declared.
- **All five templates are seeded.** The Content API requires a handle segment
  for `PRODUCT`, `COLLECTION`, `PAGE`, and `ARTICLE` — omitting it answers
  `400 A handle is required` — but it does not resolve by it: `/pages/PRODUCT/x`,
  `/pages/PRODUCT/default`, and `/pages/PRODUCT/weatherline-shell` all return
  the same default template, and a write lands on that template rather than
  creating a page under the handle sent (checked: the project still holds
  exactly its 11 pages afterwards). The seed script sends `default`.

  This was first recorded here as a Builder limitation — "only `INDEX` is
  seedable" — because the `400` was taken at face value and no handle was ever
  tried. Leo asked whether the templates had been fetched to see what handle
  they carry, which is what turned it up. The lesson is narrow and repeatable:
  a `400` naming a missing parameter says the parameter is required, not that
  the resource is unreachable.
- Routes that read `searchParams` for design-mode detection are dynamic rather
  than prerendered. `dynamicParams = false` still 404s unknown handles.
- `bun run check` green at 370 node + 131 DOM, `smoke:routes` 35/35, Home
  verified composing all 7 sections from the seeded `INDEX` template.
- **The static browser matrix regressed 12 tests, and the app was not at
  fault.** Confirmed against `main` first — 146/0 there, 134/12 here — so this
  was a real regression, not a flake. Composing a route makes it render
  dynamically, so React streams the layout's Suspense boundary: the fallback
  shell arrives first and the resolved copy waits in a hidden `S:n` carrier
  until an inline script swaps it in. `gotoReady` returned as soon as
  `#main-content` was visible, which the *fallback* already satisfies, so six
  tests queried a document holding two headers and two announcement bars, and
  clicked markup React had not wired yet. Waiting for every `S:n` carrier to be
  gone restores 146/0. A real browser was checked directly first, to be sure
  the storefront itself renders correctly — it does.
- Verified after seeding: `/` composes 7 sections, `/products/[handle]` 1 around
  the theme-owned buy block, `/shop/[handle]` 4, `/pages/[handle]` 4, and
  `/journal/[handle]` 2 — each still rendering its real `h1`.
- **The Content API cannot delete an item.** `DELETE` answers `405 Use PATCH or
  POST`, and both of those upsert rather than replace an item set. A probe item
  written while testing the write path is therefore still on the `PRODUCT`
  template, detached from the root so it never renders; it can be removed in
  Studio. Worth a Builder issue on its own.

### Removing the static fallbacks (same day)

- **Leo had already ruled on this** — "giờ có data rồi thì cần gì fallback tĩnh
  nữa … mấy route/page làm sau này cũng sẽ vậy" — and the five new routes were
  written with fallbacks anyway. The justification recorded for them ("the route
  contract requires 200 without Weaverse") was circular: the gate demanded that
  because we wrote the gate that way, not because the product does.
- **What the fallback actually cost.** Every default string lived in three
  places — the section's `presets`, the route's JSX, the seed file — with
  nothing to catch a drift. It was also a second rendering path nobody reads,
  and the reason the empty-template bug rendered a plausible page instead of an
  obvious blank one.
- The `static` browser matrix was emptying `WEAVERSE_PROJECT_ID`, so it had been
  verifying a storefront that composes nothing. All three matrices now run
  against a real project, which closes the "composed pages have no browser
  coverage" gap #67 opened with. "Static" there means the Shopify catalog and
  cart, which do have a fixture-only mode.
- Home: 164 → 41 lines. Each route now composes or `404`s.
- **The matrix caught a real defect immediately after.** The `featured-products`
  preset was written as "Shop all equipment", which the home hero already uses;
  the theme had a product count in that slot, so the collision only appeared
  once presets became the source of the copy. Two links, one accessible name,
  six failures.

### Ponytail review follow-up

- **One schema list, not three.** `components.ts`, `server-components.ts`, and
  `section-types.ts` each named all 32 schemas by hand, with a test policing the
  drift. `SECTION_SCHEMAS` is now the list; the server registry maps over it and
  pairs in the nine loaders by type. Loaders stay out of that module — a loader
  reaches the data source through `server-only`, which would make the list
  unimportable from the seed script.
- **Seed files carry only overrides.** Section `data` defaults to the schema's
  `presets`; 78 preset-identical fields dropped. Re-seeding afterwards produced
  byte-identical content, which is the proof the presets reproduce it.
- Replaced the seed's duplicate-page check with one that catches a real hazard:
  every template shares an empty handle, and item ids are keyed on it, so a
  section key reused across two templates would write both to one item.
- **Declined one finding.** Merging `pageRef` into `pagePath` saves six lines
  and makes the log print `wrote PRODUCT/default`, where `default` is a
  placeholder for a handle that does not exist. Not worth a log that lies.
- Gates after all of it: `check` 370 node + 131 DOM, `smoke:routes` 35/35,
  static browser matrix 146/0.

## 2026-09-09 — Sections as composable containers (#72)

Leo reviewed the composed sections and named three gaps, all of which held up:
no shared `Section` wrapper, no nesting at all, and the shared elements
(`heading`, `subheading`, `paragraph`, `button`) registered but used in **zero**
sections. Reading Pilot confirmed the shape: 29 of its sections go through
`app/components/section.tsx`, 34 of 79 schemas declare `childTypes`, and the
elements live as children of content blocks.

The root cause was one decision made during the extraction: sections were cut
as **whole visual bands** — one component renders one finished band — where
Pilot cuts them as **containers**. That is why every setting became a flat text
input and why the four elements had nowhere to live.

### Spike first

A throwaway section declaring `childTypes: ["heading", "paragraph"]`, written to
a `CUSTOM` page as a three-level tree, rendered `main` → `spike-stack` →
`heading` + `paragraph`, each child keeping its own `data-wv-id`. Leo confirmed
select, drag-reorder and add-child in Studio. Nothing was blocked on the SDK, so
the whole plan was safe to start. The spike was removed afterwards; its page and
items are still in the project because the Content API cannot delete them.

### Slice 1 — the shared shell

`src/components/section/` holds width, gutter, vertical rhythm, background and
overlay once, and exports the inputs a schema declares. `pageWidth` became a
theme setting and the root layout **reads theme settings for the first time**,
emitting `--container-page` — which closes the "theme settings are declared but
nothing reads them" gap carried since #67.

- **cva defaults leaked onto the outer element.** One recipe called twice put
  the width classes on both elements and dropped `px-page-gutter`; content ran
  to the viewport edge. Split into `outerVariants` / `innerVariants`, and the
  inner class is now byte-identical to the old `SHELL_SECTION_CLASS`, so no
  content edge moved.
- **`elementAttributes` swallowed `aria-labelledby`.** It forwarded only
  `data-wv-*` and `id`, so wrapping `featured-products` removed the section's
  accessible name and three browser tests went from 4 matching cards to 0. It
  forwards `aria-*` now, with a DOM test pinning it. Worth recording: typecheck,
  lint, 371 node tests, 131 DOM tests and `smoke:routes` were **all green**
  while that name was gone. Only the browser matrix noticed.

### Slice 2 — and the seed script came back, as a different thing

`section-content` is the column that holds the shared elements. `button` gained
a `link` intent rendering the underlined arrow link the sections already use —
without it, converting a section would silently turn its text link into a call
to action.

Converting `field-practice` exposed the real obstacle: changing a section's
shape strands the flat data its pages already hold, and the seed script had been
deleted in #70. Migrating by hand meant a `curl` per section with ~19 to go, no
way to remove the items left behind, and no fallback to catch a mistake. Leo
chose to rebuild the script and reseed every page.

The rebuilt script is not the old one. A seed file now says **only** which
sections a page carries and in what order; the copy, the nested children and
their settings expand from each schema's `presets`, recursively. A shape change
is a `presets` edit plus a re-run. One bug on the first pass: `expand()` ignored
a parent's preset children, so both columns of a two-column band expanded to the
same generic default — the parent's children win now, and the child schema's own
are the fallback for a column placed by hand.

### Slice 3 — smaller than expected

Checking first changed the size of it: `main-collection`, `main-article` and
`main-page` **already existed** as sections. The PDP was the only main page
content still rendering outside Weaverse.

`main-product` wraps `ProductDetail` unchanged — gallery, colorway and size
selection, price and the cart handoff own variant identity and query state and
stay in code — and takes its product from the route context. That is the
ownership rule Leo confirmed: *theme-owned means the logic lives in code, not
that the surface is invisible to Studio*. The route went from 175 lines to 75,
and all 146 browser assertions stayed green.

### Slice 4 — and what was deliberately left alone

`editorial-callout` became three content columns. Five more sections moved onto
the shared shell with no markup change, gaining width and padding settings.

Left flat on purpose: the full-bleed heroes (own grid and min-height),
`article-body` (renders Shopify blocks verbatim), the data-driven lists (no
editorial copy to lift), and the `standard-statement` statement itself, whose
`text-about-statement` size the `heading` element cannot express. Converting the
hero group needs more sizes on `heading` first, which touches the type scale and
belongs to its own issue.

The rule applied throughout: lift copy into children only where it is genuinely
editorial **and** a shared element can express it. Converting the rest
mechanically would have changed the design without giving a merchant anything.

### Verification

Every gate was re-run after **each** slice, not once at the end:
`bun run check` 371 node + 136 DOM, `smoke:routes` 35/35, static browser matrix
146/0. All eight seeded routes were checked for their real `h1` after each
reseed.
