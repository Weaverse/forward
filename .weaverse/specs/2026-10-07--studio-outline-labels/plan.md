# Plan: Adopt @weaverse/next 0.1.0-alpha.19 and Studio outline labels

## 1. Bump and drop the prefix workaround

- `@weaverse/next` `0.1.0-alpha.18` → `0.1.0-alpha.19` (exact pin). It brings `@weaverse/react` 5.22.1 and `@weaverse/schema` 0.17.0.
- `buildRequestContext` reports the unprefixed route `pathname` and `url` again. The SDK's `withPathPrefix` adds `i18n.pathPrefix` in `buildWeaverseNextRequestInfo` and `resolveRequestUrl`, and the Builder strips it when it resolves the page.
- The request test now asserts the theme's path stays unprefixed and that `buildWeaverseNextRequestInfo` reports `/de-de/shop`.
- `AGENTS.md`: the npm `latest` tag is no longer stale (`latest` = `alpha` = alpha.19); the rule stays "exact version only".

## 2. Outline labels (#89)

`label: (data: Props) => ...` on the schema, typed with the component's own Props (exported for this), so renaming a field breaks the label at compile time. The bridge evaluates it in the preview and falls back to `title` on an empty result or a throw (Weaverse/builder#3073).

| Element | Label |
| --- | --- |
| `heading`, `subheading` | `content` |
| `paragraph` | `content`, whitespace collapsed (textarea) |
| `button` | `label` |
| `kit-callout`, `product-strip` | `heading` |
| `page-origin` | `heading`, whitespace collapsed (textarea) |
| `repair-and-journal` | `repairHeading` |
| `hero-slide` | `fieldTag` (repeated child; its heading is a nested `heading`) |
| `product-spotlight`, `product-case-study` | `loaderData.product.title` (QA of the Next loader path) |

Not labelled: sections whose visible text lives in nested `heading`/`paragraph` children (they get labels there), `limit: 1` elements under `main-product`/`main-collection`/`all-products`, and textareas that pack rows (`stats`, `steps`, `principles`, `columns`).

## 3. Tests

`tests/weaverse-registry.test.ts`, "Studio outline labels": own-text labels, multi-line flattening, loader-derived labels, and every schema returning no label (not throwing) for an empty instance. No component manifest exists in Forward, so nothing to regenerate.

## 4. Manual Studio QA (Leo)

From #89: labels on rows and children, live editing, empty value falls back to title, duplicate, drag overlay, undo/redo, preview language switch, page switch, and the `loaderData` label after changing a resource picker (title if the loader fails). Also re-check that Studio's address bar keeps `/de-de/...` after navigating, now that the SDK prefixes the path.

## Files touched

| File | Change |
| --- | --- |
| `package.json`, `bun.lock` | `@weaverse/next` 0.1.0-alpha.19 |
| `src/lib/weaverse/request-info.ts` | Drop `localizePath` from `buildRequestContext` |
| `tests/weaverse-request.test.ts` | Prefix asserted through the SDK |
| `AGENTS.md` | `latest` tag note |
| `src/components/{heading,subheading,paragraph,button}/schema.ts` | `label` |
| `src/sections/{kit-callout,product-strip,page-origin,repair-and-journal,hero-slideshow/slide,product-spotlight,product-case-study}/{schema.ts,index.tsx}` | `label`; Props exported |
| `tests/weaverse-registry.test.ts` | Label tests |
| `.weaverse/specs/2026-10-07--studio-outline-labels/` | This spec |
