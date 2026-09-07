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
- Net **-1048 lines** across 17 files (447 added, 1495 removed).
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
