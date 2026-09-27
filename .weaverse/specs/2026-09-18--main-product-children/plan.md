# Plan

## Tree

```
main-product                 section shell: grid, gallery side, panel width;
│                            owns the colorway/size URL state
├── mp--media                gallery + zoom modal: layout, zoom, hint
└── mp--info                 purchase panel: sticky
    ├── mp--breadcrumb       shop label, category crumb
    ├── mp--meta             eyebrow label, spec badge
    ├── mp--title            heading tag
    ├── mp--prices           compare-at, sale badge text
    ├── mp--summary          description or subtitle
    ├── mp--variant-selector color label, swatches, selected value
    ├── mp--buy-buttons      the shared AddToCartForm
    └── mp--collapsible-details  panel toggles, titles, repair link
```

## State

- `main-product` resolves the selection from the URL (canonical `replace`
  kept from the old `ProductDetail`) and provides `{ product, selection,
  currentParams, galleryPosition }` through `MainProductContext`.
- A child rendered outside the section (Studio drop, DOM tests) derives the
  default selection from the route's `product` in `StorefrontDataContext`.
- Cart logic stays inside `AddToCartForm`; `mp--buy-buttons` only passes the
  selection through.

## Safeguards

- A `main-product` with no children (a template seeded before this change)
  renders the default composition, so a product URL is never without gallery,
  selection and add to cart.
- Every setting has a code default equal to its schema default.
- (2026-09-27) The route no longer renders `main-product` itself when the page
  omits it: a Weaverse project always ships its default templates.

## Files

- `src/sections/main-product/**` (context, shell, `media/`, `info/`, one
  folder per element)
- `src/app/products/[productHandle]/product-detail.tsx` (removed; split into
  the children)
- `src/lib/weaverse/components.ts`, `src/lib/weaverse/section-schemas.ts`
- `tests/dom/product-detail.test.tsx`
- `scripts/weaverse-seed/template-product.json`
- `AGENTS.md`
