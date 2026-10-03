import "server-only";

import { cache } from "react";

import { loadWeaverseThemeSettings } from "@/lib/weaverse/server";
import type { LocaleId } from "./locales";
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
