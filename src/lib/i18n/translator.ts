import "server-only";

import type { Metadata } from "next";
import { cache } from "react";

import { loadWeaverseThemeSettings } from "@/lib/weaverse/server";
import { marketAlternates } from "./alternates";
import { DEFAULT_LOCALE, type LocaleId, parseLocale } from "./locales";
import { STATIC_CONTENT, type TranslationKey } from "./static-content";
import { createTranslator } from "./translate";

/**
 * Theme copy for Server Components, in the market's published translation.
 *
 * Use it only where a client `<T>` leaf cannot go: attributes on server
 * markup and metadata. It never sees unsaved Studio edits, which live in the
 * browser's translation store; text nodes render through `<T>` so they do.
 */
export const getTranslator = cache(async (locale: LocaleId) => {
  const response = await loadWeaverseThemeSettings(locale);
  return createTranslator<TranslationKey>({
    overrides: response?.merchantOverrides,
    staticContent: STATIC_CONTENT,
  });
});

/**
 * Metadata for a page whose title and description are theme copy, in the
 * route's market. `path` (unprefixed) adds the market canonical and, where it
 * applies, `hreflang` alternates; `robots` passes through unchanged.
 */
export async function translatedMetadata(
  params: Promise<{ locale: string }>,
  {
    title,
    description,
    path,
    robots,
  }: {
    title: TranslationKey;
    description: TranslationKey;
    path?: string;
    robots?: Metadata["robots"];
  },
): Promise<Metadata> {
  const locale = parseLocale((await params).locale) ?? DEFAULT_LOCALE;
  const t = await getTranslator(locale);
  return {
    title: t(title),
    description: t(description),
    ...(path === undefined
      ? {}
      : { alternates: marketAlternates(path, locale) }),
    ...(robots === undefined ? {} : { robots }),
  };
}
