"use client";

import { usePathname as useNextPathname } from "next/navigation";
import { createContext, type ReactNode, useContext } from "react";

import { DEFAULT_LOCALE, type LocaleId, splitLocale } from "./locales";

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

/**
 * The pathname as the shopper sees it. On the server Next reports the
 * proxy's rewrite target, so the default market's `/shop` reads as
 * `/en-us/shop` until hydration; its prefix never belongs in a URL.
 */
export function usePathname(): string {
  const pathname = useNextPathname();
  const { locale, path } = splitLocale(pathname);
  return locale === DEFAULT_LOCALE ? path : pathname;
}
