"use client";

import { createContext, type ReactNode, useContext } from "react";

import { DEFAULT_LOCALE, type LocaleId } from "./locales";

const LocaleContext = createContext<LocaleId>(DEFAULT_LOCALE);

/** The locale of the page being rendered, for client components below it. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: LocaleId;
  children: ReactNode;
}) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): LocaleId {
  return useContext(LocaleContext);
}
