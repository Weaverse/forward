import { DEFAULT_LOCALE, type LocaleId, splitLocale } from "./locales";

/**
 * What the proxy does with a request path, before any account logic runs.
 *
 * - `/en-us/*` names the default locale explicitly: redirect to the path
 *   without it, so each page has one URL.
 * - A known non-default prefix is served as it is.
 * - Anything else is the default locale; it is rewritten under `/en-us` so it
 *   resolves in `app/[locale]/` while the URL stays unprefixed.
 *
 * `path` is always the locale-free path, which is what the account boundary
 * and the protocol paths match on.
 */
export type LocaleRoute =
  | { kind: "redirect"; path: string }
  | { kind: "serve"; locale: LocaleId; path: string }
  | { kind: "rewrite"; locale: LocaleId; path: string; target: string };

export function resolveLocaleRoute(pathname: string): LocaleRoute {
  const { locale, path } = splitLocale(pathname);
  if (locale === DEFAULT_LOCALE) {
    return { kind: "redirect", path };
  }
  if (locale !== null) {
    return { kind: "serve", locale, path };
  }
  return {
    kind: "rewrite",
    locale: DEFAULT_LOCALE,
    path,
    target: path === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${path}`,
  };
}
