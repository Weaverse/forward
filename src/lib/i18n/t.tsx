"use client";

import { useTranslation } from "@weaverse/next";
import { useSyncExternalStore } from "react";

import { STATIC_CONTENT, type TranslationKey } from "./static-content";
import { createTranslator, type TranslationVariables } from "./translate";

const NO_EDITS: Readonly<Record<string, string>> = {};

function noEdits() {
  return NO_EDITS;
}

function noSubscription() {
  return () => {};
}

/**
 * Theme copy for client components.
 *
 * Reads the market's published overrides and Studio's live edits from the
 * Weaverse root provider, then resolves through the same translator the
 * server uses, so both sides agree on precedence and empty values.
 */
export function useT() {
  const { merchantOverrides, translationStore } = useTranslation();
  const designOverrides = useSyncExternalStore(
    translationStore?.subscribe ?? noSubscription,
    translationStore?.getSnapshot ?? noEdits,
    translationStore?.getServerSnapshot ?? noEdits,
  );
  return createTranslator<TranslationKey>({
    designOverrides,
    overrides: merchantOverrides,
    staticContent: STATIC_CONTENT,
  });
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
