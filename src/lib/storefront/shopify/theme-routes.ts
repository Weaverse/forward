/**
 * Shopify storefront paths and the theme routes that serve them.
 *
 * Menus and merchant-authored content both link with Shopify's own paths.
 * The theme has one journal, so every blog maps onto it. A path with no route
 * here maps to `null`; the caller decides whether that is a dropped menu link
 * or a rejected content link.
 */
const THEME_ROUTES: readonly [RegExp, (match: RegExpMatchArray) => string][] = [
  [/^\/$/, () => "/"],
  [/^\/collections\/all$/, () => "/shop"],
  [/^\/collections\/([^/]+)$/, (match) => `/shop/${match[1]}`],
  [/^\/blogs\/[^/]+$/, () => "/journal"],
  [/^\/blogs\/[^/]+\/([^/]+)$/, (match) => `/journal/${match[1]}`],
  [/^\/(shop|journal|products|pages|policies)(\/[^/]+)?$/, (match) => match[0]],
  [/^\/(search|account|cart)$/, (match) => match[0]],
];

/**
 * Shopify answers a market's reads with that market's subfolder on every path
 * (`/en-gb/collections/forward`). The theme `Link` prefixes the shopper's own
 * market, so a theme route never carries one.
 */
const MARKET_SUBFOLDER = /^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/;

export function toThemePath(path: string): string | null {
  return (
    matchThemeRoute(path) ??
    matchThemeRoute(path.replace(MARKET_SUBFOLDER, "") || "/")
  );
}

function matchThemeRoute(path: string): string | null {
  for (const [pattern, route] of THEME_ROUTES) {
    const match = path.match(pattern);
    if (match !== null) {
      return route(match);
    }
  }
  return null;
}
