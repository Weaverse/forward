"use client";

import { useTranslation } from "@weaverse/next";
import {
  createContext,
  type ReactNode,
  useContext,
  useSyncExternalStore,
} from "react";

import { STATIC_CONTENT, type TranslationKey } from "./static-content";
import { createTranslator, type TranslationVariables } from "./translate";

const NO_EDITS: Readonly<Record<string, string>> = {};

const ThemeContentContext =
  createContext<Readonly<Record<string, unknown>>>(STATIC_CONTENT);

/**
 * The market's theme copy (English plus its language bundle), resolved on the
 * server so the browser receives one language, not every bundle.
 */
export function ThemeContentProvider({
  value,
  children,
}: {
  value: Readonly<Record<string, unknown>>;
  children: ReactNode;
}) {
  return <ThemeContentContext value={value}>{children}</ThemeContentContext>;
}

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
  const staticContent = useContext(ThemeContentContext);
  return createTranslator<TranslationKey>({
    designOverrides,
    overrides: merchantOverrides,
    staticContent,
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
