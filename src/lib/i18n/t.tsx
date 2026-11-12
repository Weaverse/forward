"use client";

import { useTranslation } from "@weaverse/hydrogen/next";

import type { TranslationKey } from "./static-content";
import type { Translate, TranslationVariables } from "./translate";

/**
 * Theme copy for client components.
 *
 * The Weaverse root provider's `t` already resolves the market's published
 * overrides and Studio's live edits through the SDK's `createTranslate`, the
 * resolver the server uses too, so both sides agree on precedence and empty
 * values.
 */
export function useT(): Translate<TranslationKey> {
  return useTranslation().t;
}

/**
 * One translated text node. Server Components render this leaf so Studio's
 * live edits reach copy they own.
 */
export function T({
  k,
  vars,
}: {
  k: TranslationKey;
  vars?: TranslationVariables;
}) {
  return useT()(k, vars);
}
