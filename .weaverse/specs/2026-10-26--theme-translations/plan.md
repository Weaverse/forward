# Plan: theme copy as JSON with per-language bundles

## Context

- Forward served five markets (`en-us`, `en-gb`, `de-de`, `fr-fr`, `ja-jp`) but its theme copy was English only, in `src/lib/i18n/static-content.ts`. Until a merchant translated every key in Studio, German, French and Japanese markets rendered English UI copy.
- Pilot ships `app/i18n/en.json` plus one JSON per language and merges the market's bundle over English in `app/.server/translations.ts` (`resolveThemeContent`), passing the result as `staticContent`, not `merchantOverrides`.
- A JSON import keeps `TranslationKey` (key paths are still derived); only the `as const` literal values and five JSDoc comments are lost, and neither was used.

## Design

- `src/translations/` holds data only: `en.json` (source), `de.json`, `fr.json`, `ja.json`. Bundles omit the two intentionally empty English keys (`announcement.text`, `footer.tagline`).
- `src/lib/i18n/static-content.ts` imports `en.json` and keeps exporting `STATIC_CONTENT`, `TranslationKey` and `ThemeTranslate`, so no caller changes. `themeSchema.i18n.staticContent` stays English: it is what Studio's Translation Manager lists.
- `src/lib/i18n/theme-content.ts` exports `themeContent(locale)`: the bundle for the market's `language` deep-merged over English, or English itself. Only server code imports it, so the browser never downloads every bundle.
- Server: `getTranslator(locale)` uses `themeContent(locale)`.
- Client: the `[locale]` layout passes `themeContent(locale)` to `WeaverseRoot` as `staticContent`. `WeaverseRoot` hands it to `WeaverseNextRootProvider` and to a small `ThemeContentProvider` context in `src/lib/i18n/t.tsx`, which `useT()` reads (the SDK's `useTranslation()` does not expose `staticContent`). The context defaults to English, so DOM tests and other roots keep working.
- Resolution order is unchanged: live Studio edit, then Studio translation (`merchantOverrides`), then the bundled language, then English, then the key.

## Steps

1. Export `STATIC_CONTENT` to `src/translations/en.json`; reduce `static-content.ts` to the JSON import and the key types.
2. Write `de.json`, `fr.json`, `ja.json`, keeping every `{{placeholder}}`.
3. Add `themeContent()` and wire it into `getTranslator`, the layout, `WeaverseRoot` and `useT`.
4. Add `tests/theme-content.test.ts`: English markets get the source, a bundle layers key by key, a Studio translation still wins, and every bundle covers every English key with the same placeholders.
5. Update `AGENTS.md` and `README.md`.
6. Run the full `check` before pushing.

## Out of scope

- Professional review of the machine-assisted translations (worth doing, especially Japanese).
- A country `<select>` for addresses, and other copy changes.
- Docs: tracked in Weaverse/docs#104.

## Files and folders touched

- `src/translations/en.json`, `de.json`, `fr.json`, `ja.json` (new)
- `src/lib/i18n/static-content.ts`
- `src/lib/i18n/theme-content.ts` (new)
- `src/lib/i18n/translator.ts`
- `src/lib/i18n/t.tsx`
- `src/lib/weaverse/root.tsx`
- `src/app/[locale]/layout.tsx`
- `tests/theme-content.test.ts` (new), `tests/dom/harness.tsx`, `tests/dom/translation.test.tsx`
- `AGENTS.md`, `README.md`
- `.weaverse/specs/2026-10-26--theme-translations/`
