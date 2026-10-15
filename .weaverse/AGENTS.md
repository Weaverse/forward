# Weaverse maintainer guidance

This file is internal to the Weaverse/forward repository. It is removed from
copies scaffolded by `@weaverse/cli`, so nothing in the root `AGENTS.md` may
depend on it. Read the root `AGENTS.md` first; every rule there applies here
too, and the rules below add to it.

## Spec-driven development

Specs live in `.weaverse/specs/`, one folder per change named
`YYYY-MM-DD--kebab-title`, each with `README.md` (Status, Owner, Created, Last
Updated, Original Prompt, Summary), `plan.md` (under 500 lines, with a
files-touched section) and an optional append-only `work-logs.md`. All spec
text is English.

## Origin and references

- Implement from scratch in this repository.
- Do not fork, import, copy, port, or emulate Pilot code, architecture,
  sections, or visual design. Reading Pilot to learn how a Weaverse theme
  *organizes* its files was authorized by Leo on 2026-09-08 and is the only
  permitted use: layout conventions may be adopted, implementation may not.
  Nothing in this repository is a translation of Pilot source.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--static-demo-productionization/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.
- The Shopify adapter continues to replace the data source one domain at a
  time without rewriting page composition.

## Approval record

These root `AGENTS.md` rules were approved changes to the architecture. The
rule text lives in the root file; this is their provenance.

- Approved change (2026-09-22): catalog browsing is composed (the
  `main-collection` and `all-products` trees). `collection-grid`,
  `catalog-facets.ts`, `FilterSidebar` and `product-results` are retired.
- Approved change (2026-10-13): the collection list is the Weaverse
  `COLLECTION_LIST` page at `/categories`.
- Approved change (2026-10-12): a Shopify blog is the Weaverse `BLOG` page at
  `/archive/:blog`, and `/journal` is the Weaverse `CUSTOM` page `journal`.
- Approved change (2026-09-18): the PDP buy block is the composable
  `main-product` section.
- Approved exception (2026-09-15): `product-spotlight` may embed the shared
  `AddToCartForm`.
- Approved change (2026-10-09): the public Storefront token reaches the browser
  through Weaverse's `publicEnv`.

## Retired styles

- `canonical-source.css`, `site-header.css`, and `production-polish.css` are
  retired. Do not restore legacy selectors or compatibility imports.

## Store operations and credentials

- Storefront Content/Cart credentials, Customer Account setup, and the
  Weaverse connection are approved for the current ordered slices under the
  spec's guarded Store-operation protocol. Payment activation and uncontrolled
  customer/order data remain outside that approval. Never add a `.env` file to
  a repository or worktree.

## Safety

- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
