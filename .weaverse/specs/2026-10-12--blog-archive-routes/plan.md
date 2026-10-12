# Plan: Blogs at /archive/:blog and a composed /journal

## Routes

| Page | Route | Weaverse page |
| --- | --- | --- |
| Blog | `/archive/[blogHandle]` | `BLOG`, declared as `routes.BLOG: "/archive/:handle"` |
| Article | `/journal/[articleHandle]` (unchanged) | `ARTICLE` |
| All articles | `/journal` | `CUSTOM` page `journal`, served by `[...slug]` |

- Articles keep their own handle. When two blogs share one, the newest article wins (accepted; handles are only unique per blog in Shopify).
- Redirects by pattern, no store lookup: `/blogs/:blogHandle` → `/archive/:blogHandle`, `/blogs/:blogHandle/:articleHandle` → `/journal/:articleHandle`. They replace the hardcoded `/blogs/journal` pair. Menu links map the same way (`theme-routes.ts`).

## Data

- `CONTENT_QUERY` also reads the store's blogs (bounded like pages and articles: past `CONTENT_BLOG_LIMIT` the read fails closed) and each article's `blog { handle title }`.
- `listBlogs()` / `getBlog(handle)` return each blog with its articles. A blog with none still exists and renders: Studio's default blog is often Shopify's empty "News", and a 404 there leaves the preview unable to connect ("Preview connection lost").
- The sitemap lists every blog.

## Sections

Two shells, one set of children, like the browse trees share their toolbar and grid:

- `all-articles`: every article, read in its own `loader` (`listArticles`). Composes `/journal`.
- `main-blog`: `BLOG` pages only; the blog arrives through the data context.
- Both render through the shared `Section` (layout inputs, full width and no padding by default) and hand the articles to their children through `ArticleFeedContext`, the `MainProductContext` pattern. A child never reads data itself.
- Children (`src/sections/article-feed/`), each on the shared `Section` with its own width setting:
  - `af--header`: the dark masthead (`IndexHeader`). An empty heading falls back to the blog's title on a `BLOG` page and hides the header elsewhere.
  - `af--lead` ("Latest article"): the newest article as a full-width card (`JournalLead`).
  - `af--grid` ("Articles grid"): the articles three across (`JournalGrid`, which no longer carries its own container), with width and vertical padding; "Skip the latest article" is on by default and is turned off when the latest-article card is removed.
- Copy that the theme-rendered `/journal` read from static content becomes the children's presets (merchant-authored), and the now-unused `journal.*` and `meta.journal*` keys go.

## Seeds

- `page-journal.json` (`CUSTOM`, handle `journal`) with `all-articles`; `template-blog.json` with `main-blog`.
- They must be applied to the project (`bun run seed:weaverse --apply`) before this ships, or `/journal` answers 404.

## Not in scope

- The default article in Studio's page selector: Weaverse/builder#3177.

## Verification

- Full gates and `smoke:routes` before push.
- Manual: page selector opens a blog at `/archive/<blog>`; `/journal` lists every article and is editable; `/journal/<article>` unchanged; `/blogs/<blog>` and `/blogs/<blog>/<article>` redirect.

## Files touched

| File | Change |
| --- | --- |
| `src/lib/storefront/shopify/{content-query,content-mapper,data-source}.ts`, `src/lib/storefront/{data-source,types}.ts` | Article blog, `getBlog` |
| `src/app/[locale]/archive/[blogHandle]/page.tsx` | New `BLOG` route |
| `src/app/[locale]/journal/page.tsx` | Removed (now `CUSTOM`) |
| `src/lib/weaverse/{request-info,theme-schema,data-context,components,section-schemas}.ts(x)` | `BLOG` page type, route, context, registry |
| `src/sections/{all-articles/,main-blog/,article-feed/}`, `src/sections/journal-grid.tsx` | Shells, `af--*` children, grid container moved to `Section` |
| `src/lib/routes/route-contract.ts`, `src/lib/storefront/shopify/theme-routes.ts`, `src/app/sitemap.ts` | Routes, redirects, menu mapping, sitemap |
| `src/lib/i18n/static-content.ts` | Unused journal keys removed |
| `scripts/weaverse-seed/{page-journal,template-blog}.json` | Seeds |
| `tests/**` | Fixtures and expectations |
| `.weaverse/specs/2026-10-12--blog-archive-routes/` | This spec |
