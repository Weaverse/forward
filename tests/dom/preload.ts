/**
 * DOM test preload (`bun run test:dom` only).
 *
 * Registers Happy DOM and replaces the Next.js modules that need a Next
 * server runtime with small doubles, so client components can be rendered and
 * driven with real user interaction. This preload is deliberately *not* a
 * global `bunfig.toml` preload: `bun run test:node` must keep running with no
 * `document`/`window`, because `src/lib/storefront/shopify/env.ts` and
 * `src/lib/account/env.ts` intentionally refuse to read credentials whenever a
 * browser global exists.
 */

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, mock } from "bun:test";
import { createElement, type ReactNode } from "react";

GlobalRegistrator.register({ url: "http://localhost/" });

/* React 19 + Testing Library need the act environment flag set before render. */
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/* ---------------------------------------------------------------- routing */

export interface RouteState {
  pathname: string;
  searchParams: URLSearchParams;
  replaced: string[];
  pushed: string[];
}

const route: RouteState = {
  pathname: "/",
  searchParams: new URLSearchParams(),
  replaced: [],
  pushed: [],
};

/** Points the `next/navigation` double at one route for the current test. */
export function setRoute(pathname: string, query = ""): RouteState {
  route.pathname = pathname;
  route.searchParams = new URLSearchParams(query);
  route.replaced.length = 0;
  route.pushed.length = 0;
  return route;
}

export function currentRoute(): RouteState {
  return route;
}

mock.module("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => route.searchParams,
  useRouter: () => ({
    replace: (href: string) => route.replaced.push(href),
    push: (href: string) => route.pushed.push(href),
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
    prefetch: () => undefined,
  }),
  notFound: () => {
    throw new Error("notFound()");
  },
}));

/* ----------------------------------------------------------------- link */

interface LinkProps {
  href: string;
  children?: ReactNode;
  scroll?: boolean;
  prefetch?: boolean;
  replace?: boolean;
  [key: string]: unknown;
}

mock.module("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    scroll,
    prefetch,
    replace,
    ...rest
  }: LinkProps) => createElement("a", { href, ...rest }, children),
}));

/* ---------------------------------------------------------------- image */

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
  loading?: string;
  [key: string]: unknown;
}

/**
 * Renders the real `img` contract the optimizer would emit — `src`, `alt`,
 * `sizes`, intrinsic dimensions and loading hint — without needing the Next
 * image runtime. `fill` becomes an explicit attribute so layout-mode intent
 * stays assertable; geometry itself is proven in the Playwright suite.
 */
mock.module("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    sizes,
    fill,
    priority,
    loading,
    ...rest
  }: ImageProps) =>
    createElement("img", {
      src,
      alt,
      width,
      height,
      sizes,
      loading: loading ?? (priority === true ? "eager" : "lazy"),
      "data-fill": fill === true ? "true" : undefined,
      "data-priority": priority === true ? "true" : undefined,
      ...rest,
    }),
}));

/* ---------------------------------------------------------------- fonts */

mock.module("next/font/google", () => ({
  Archivo: () => ({ variable: "--font-archivo", className: "font-archivo" }),
  Manrope: () => ({ variable: "--font-manrope", className: "font-manrope" }),
  IBM_Plex_Mono: () => ({
    variable: "--font-plex-mono",
    className: "font-plex-mono",
  }),
}));

/* --------------------------------------------------------------- cleanup */

const { cleanup } = await import("@testing-library/react");
const { getCartSnapshot, removeCartLine } = await import(
  "@/lib/demo-cart/store"
);

afterEach(() => {
  cleanup();
  for (const line of [...getCartSnapshot()]) {
    removeCartLine(line.key);
  }
  document.body.className = "";
  document.body.innerHTML = "";
  window.localStorage.clear();
  route.replaced.length = 0;
  route.pushed.length = 0;
});
