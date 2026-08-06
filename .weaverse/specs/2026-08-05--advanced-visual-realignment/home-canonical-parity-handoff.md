# Home canonical parity correction

Date: 2026-08-06
Branch: `fix/home-canonical-parity`
Base: merged `main@9f506d304e3d26e60156c4228a8acaa14d0fe0f9`

## Why this correction exists

Leo rejected the merged Home as visually completely different from the canonical Advanced POC. Prior route/runtime QA proved technical health but was incorrectly treated as visual evidence. This pass must match the canonical screenshot's page-level composition, not merely its palette or typography family.

## Authoritative evidence

Use these two user-captured desktop screenshots as the source of truth:

- Current merged Preview: `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-user-evidence-2026-08-06/screencapture-forward-abhk47fol-hta218-vercel-app-2026-08-06-09_38_41.png`
- Canonical Advanced POC: `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-user-evidence-2026-08-06/screencapture-weaverse-hydrogen-next-poc-vercel-app-theme-preview-advanced-index-html-2026-08-06-09_38_30.png`
- Full side-by-side: `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-user-evidence-2026-08-06/full-page.jpg`
- First fold: `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-user-evidence-2026-08-06/top-2100.jpg`
- Vertical bands: the three `band-*.jpg` files in the same folder.

The screenshots are both 2560px wide. The current page is 5247px tall; the canonical is 7389px tall. Do not chase height numerically with empty padding, but reproduce the canonical section scale, whitespace, image area, overlaps, and cadence that create that length.

Canonical rendered URL: `https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home`.

## Blocking divergences to correct

1. Hero: current uses a narrow 7/5 grid and a five-line inward headline. Canonical is an almost full-viewport editorial canvas with a much larger right image, left rail/body, and a two-line headline crossing the image on cream strips: `Move until` / `the map runs out.`
2. Operating premise: current is a compressed single text block. Canonical is a large three-column composition with ghost `01`, `Carry less. / Notice more.`, body, metrics, link, and substantial vertical space.
3. Field dossier: current collage is small. Canonical uses a large overlapping landscape + portrait/detail collage, circular altitude mark, acid edge, large quote, and generous whitespace.
4. Equipment index: current is a uniform three-column catalog row using shared `ProductCard`. Canonical is a large asymmetric editorial field of differently sized/staggered plates. There are only three real products in Forward; use exactly those three normalized products and their real colorway images. Do not invent a fourth product. Build a Home-specific plate component and use primary/alternate/context imagery to reproduce the lifestyle/editorial rhythm.
5. Dispatch: current is a shallow dark strip. Canonical is near viewport-height, with a dominant mountain image and a large dark editorial panel.
6. Movement systems: current is a short equal row. Canonical has a large heading, generous whitespace, and three staggered cards with different dimensions and dark caption blocks.
7. Footer: current is compressed. Canonical has a taller dark close, larger stacked wordmark, wider column geometry, more whitespace, and a substantial lower rail.

## Allowed implementation scope

Primary files:

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/site-footer.tsx`

Only touch another presentation file if absolutely necessary and explain why in your final output.

## Hard constraints

- Do not edit `src/lib/**`, tests, scripts, public assets, package files, lockfile, configs, routes, cart logic, or credentials.
- Pages/components must continue consuming normalized data only through `storefront`.
- Do not import raw fixtures.
- Keep all three real Forward products and collections; no fake fourth product.
- Keep local approved media; no hotlinks and no new images.
- Preserve semantic headings, links, alt text, keyboard access, reduced motion, and mobile no-overflow behavior.
- Do not copy the POC source implementation; reproduce rendered composition from evidence.
- Do not commit, push, deploy, open/update PRs, or modify the primary checkout/server.

## Desktop acceptance

At 2560px full-page capture, strict side-by-side review must show:

- the same broad section sequence and dominant image/text proportions;
- hero headline crossing the image, with comparable image dominance and first-fold height;
- a large canonical-like operating premise grid;
- a large overlapping field collage;
- asymmetric editorial product plates rather than a uniform catalog row;
- a near-viewport dark dispatch section;
- spacious staggered movement cards;
- a tall canonical-like footer;
- page rhythm/length materially close to canonical for real compositional reasons.

## Mobile acceptance

At 390x844:

- hero remains legible and art-directed without desktop overlap collisions;
- every collage/plate stacks intentionally;
- no horizontal overflow;
- all links and controls remain usable;
- images are not accidentally hidden or zero-height.

## Pass 1 strict review — required corrections

The first implementation pass materially aligned the macro sequence and page cadence, but it is not accepted yet. Correct these residual blockers without broadening scope:

1. At 2560px the hero headline wraps as three lines (`Move until` / `the map` / `runs out.`). Canonical is exactly two lines (`Move until` / `the map runs out.`). Reduce desktop mega type or widen/reposition the second line so it stays one line while still crossing the image on a cream strip. Keep mobile wrapping intentional.
2. Image roles are reversed. The canonical Field Dossier's dominant image is the hikers/trail image available from the normalized High Route collection. The canonical dark Dispatch dominant image is the mountain panorama available as `themeContent.standardBandImage`. Pass those normalized images into the correct sections; do not change fixtures or hardcode public paths.
3. The dossier/equipment/movement editorial groups remain slightly too narrow at 2560. Increase only those Home canvas max widths modestly (for example from `max-w-7xl` toward a 90rem editorial canvas) while preserving intentional whitespace and mobile padding. Do not make all interior pages wider.
4. The pass-1 footer overshoots canonical: the stacked wordmark is much too large and the footer is too tall. Reduce the stacked wordmark and desktop footer padding to sit between the original compressed footer and pass 1. Target approximately the canonical screenshot's wordmark/footer proportions.

Pass-1 evidence:

- `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-local-qa-2026-08-06/pass-1-vs-canonical-full.jpg`
- `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-local-qa-2026-08-06/pass-1-vs-canonical-top.jpg`
- `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-local-qa-2026-08-06/pass-1-vs-canonical-band-2.jpg`
- `/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-local-qa-2026-08-06/pass-1-vs-canonical-band-3.jpg`

## Required worker verification

Run focused checks only while editing:

```bash
bun run typecheck
bun run lint
bun run format:check
```

Hermes will run full build/tests/routes/browser/visual verification after the diff stabilizes.
