import de from "@/translations/de.json" with { type: "json" };
import fr from "@/translations/fr.json" with { type: "json" };
import ja from "@/translations/ja.json" with { type: "json" };
import { LOCALES, type LocaleId } from "./locales";
import { STATIC_CONTENT } from "./static-content";

type Copy = Readonly<Record<string, unknown>>;

/**
 * Theme-shipped translations, keyed by the market's language lowercased.
 *
 * English is absent: it is `STATIC_CONTENT` itself. Import this module from
 * server code only, so the browser never downloads every language.
 */
const BUNDLES: Record<string, Copy> = { de, fr, ja };

function isGroup(value: unknown): value is Copy {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merges `overrides` onto `base`, recursing into groups, so a partial bundle
 * keeps every English sibling it does not translate.
 */
function deepMerge(base: Copy, overrides: Copy): Copy {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key];
    merged[key] =
      isGroup(current) && isGroup(value) ? deepMerge(current, value) : value;
  }
  return merged;
}

/**
 * The theme's own copy for `locale`: English with that market's language
 * bundle layered on top.
 *
 * It is `staticContent`, never `merchantOverrides`: the translator resolves
 * `override ?? staticContent`, so a Studio translation still wins, and the
 * bundle must not pass for copy the merchant published.
 */
export function themeContent(locale: LocaleId): Copy {
  const bundle = BUNDLES[LOCALES[locale].language.toLowerCase()];
  return bundle === undefined
    ? STATIC_CONTENT
    : deepMerge(STATIC_CONTENT, bundle);
}
