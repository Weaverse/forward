import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import { createShopifyRequestContext } from "@shopify/hydrogen";
import {
  createCustomerAccountServerHandlers,
  createCustomerSession,
} from "@shopify/hydrogen/customer-account";
import { NextRequest } from "next/server";

import type { CustomerAccountConfig } from "../src/lib/account/env.ts";
import {
  ACCOUNT_PATH,
  createCustomerAccountRuntime,
  CUSTOMER_ACCOUNT_PROTOCOL_PATHS,
  loginHref,
  MAX_RETURN_TO_BYTES,
  refreshHref,
  REFRESH_MARKER_PARAM,
} from "../src/lib/account/customer-account.ts";
import { createCustomerAccountSessionManager } from "../src/lib/account/session-manager.ts";
import { ACCOUNT_PROTOCOL_PATHS } from "../src/lib/routes/route-contract.ts";
import { proxy } from "../src/proxy.ts";

const CONFIG: CustomerAccountConfig = {
  shopId: "97847574828",
  clientId: "shp_00000000-0000-4000-8000-000000000000",
  sessionSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
  storefrontOrigin: "https://forward-sandy.vercel.app",
};

const RUNTIME = createCustomerAccountRuntime(CONFIG);
const I18N = { country: "US", language: "EN" } as const;

function configureProxyAccountEnvWithoutCatalog(): void {
  process.env.SHOP_ID = CONFIG.shopId;
  process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID = CONFIG.clientId;
  process.env.CUSTOMER_ACCOUNT_SESSION_SECRET = CONFIG.sessionSecret;
  process.env.PUBLIC_STOREFRONT_ORIGIN = CONFIG.storefrontOrigin;
  delete process.env.PUBLIC_STORE_DOMAIN;
  delete process.env.PRIVATE_STOREFRONT_API_TOKEN;
  delete process.env.PUBLIC_STOREFRONT_API_TOKEN;
}

function requestContext(request: Request) {
  return createShopifyRequestContext({ request, i18n: I18N });
}

async function sessionManager(cookieHeader: string | null = null) {
  return createCustomerAccountSessionManager({
    config: CONFIG,
    cookieHeader,
    secure: true,
  });
}

/** Runs one protocol handler exactly as `handleShopifyRoutes` would. */
async function runHandler(
  handler: (typeof RUNTIME.handlers)[keyof typeof RUNTIME.handlers],
  request: Request,
  cookieHeader: string | null = null,
) {
  const manager = await sessionManager(cookieHeader);
  const result = await handler({
    request,
    sessionManager: manager,
    requestContext: requestContext(request),
  });
  return { result, manager };
}

function sealedCookieFrom(headers: HeadersInit | undefined): string | null {
  const setCookie = new Headers(headers).get("set-cookie");
  if (setCookie === null) {
    return null;
  }
  return setCookie.split(";", 1)[0] ?? null;
}

describe("customer account route ownership", () => {
  it("registers exactly the four pinned protocol paths", () => {
    assert.deepEqual(
      [...CUSTOMER_ACCOUNT_PROTOCOL_PATHS].sort(),
      [...ACCOUNT_PROTOCOL_PATHS].sort(),
    );
    assert.deepEqual(
      Object.values(RUNTIME.handlers)
        .map((handler) => `${handler.method} ${handler.pathname}`)
        .sort(),
      [
        "GET /account/authorize",
        "GET /account/login",
        "GET /account/refresh",
        "POST /account/logout",
      ],
    );
  });

  it("has no App Router route colliding with a protocol path", async () => {
    for (const protocolPath of ACCOUNT_PROTOCOL_PATHS) {
      for (const leaf of ["page.tsx", "route.ts", "page.ts", "route.tsx"]) {
        const candidate = path.join(
          process.cwd(),
          "src/app",
          protocolPath.slice(1),
          leaf,
        );
        await assert.rejects(
          access(candidate),
          `${protocolPath}/${leaf} must not exist; proxy.ts owns this path`,
        );
      }
    }
  });

  it("keeps one proxy over the complete account boundary", async () => {
    const source = await readFile(
      path.join(process.cwd(), "src/proxy.ts"),
      "utf8",
    );
    assert.equal(source.match(/handleShopifyRoutes\(/g)?.length, 1);
    const matcher = source.slice(source.indexOf("matcher: ["));
    assert.ok(matcher.includes('"/account/:path*"'));
    assert.ok(source.includes("CUSTOMER_ACCOUNT_PROTOCOL_PATH_SET.has"));
  });
});

describe("login route", () => {
  it("builds an Authorization Code + PKCE S256 login URL from the configured origin", async () => {
    const { result } = await runHandler(
      RUNTIME.handlers.login,
      new Request("https://attacker.example/account/login", {
        headers: {
          host: "attacker.example",
          "x-forwarded-host": "attacker.example",
          forwarded: "host=attacker.example",
        },
      }),
    );
    assert.equal(result.type, "redirect");
    assert.ok(result.type === "redirect");
    const login = new URL(result.location);

    assert.equal(login.origin, "https://shopify.com");
    assert.equal(
      login.pathname,
      `/authentication/${CONFIG.shopId}/oauth/authorize`,
    );
    assert.equal(
      login.searchParams.get("redirect_uri"),
      `${CONFIG.storefrontOrigin}/account/authorize`,
    );
    assert.equal(login.searchParams.get("client_id"), CONFIG.clientId);
    assert.equal(login.searchParams.get("response_type"), "code");
    assert.equal(login.searchParams.get("code_challenge_method"), "S256");
    assert.ok((login.searchParams.get("state") ?? "").length >= 32);
    assert.ok((login.searchParams.get("nonce") ?? "").length >= 32);
    assert.ok((login.searchParams.get("code_challenge") ?? "").length >= 32);
    // The verifier itself never leaves the server.
    assert.equal(login.searchParams.get("code_verifier"), null);
  });

  it("commits a no-store 303 that carries the encrypted pending login", async () => {
    const { result } = await runHandler(
      RUNTIME.handlers.login,
      new Request(`${CONFIG.storefrontOrigin}/account/login`),
    );
    assert.ok(result.type === "redirect");
    const headers = new Headers(result.headers);
    assert.equal(headers.get("cache-control"), "no-store");
    const setCookie = headers.get("set-cookie");
    assert.ok(setCookie);
    assert.match(setCookie, /^forward_customer_account=v1\./);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);
    assert.match(setCookie, /Secure/);
    assert.ok(
      !setCookie.includes(
        new URL(result.location).searchParams.get("state") ?? "\0",
      ),
    );
  });

  it("rejects a cross-origin return target instead of following it", async () => {
    const { result, manager } = await runHandler(
      RUNTIME.handlers.login,
      new Request(
        `${CONFIG.storefrontOrigin}/account/login?return_to=${encodeURIComponent("https://attacker.example/steal")}`,
      ),
    );
    assert.ok(result.type === "redirect");
    const pending = (await manager.getSessionItem("customerAccount")) as {
      pendingLogin: { returnTo: string };
    };
    assert.equal(pending.pendingLogin.returnTo, ACCOUNT_PATH);
  });

  it("caps Forward-built login targets at 512 UTF-8 bytes", () => {
    const long = `/account/orders/${"a".repeat(MAX_RETURN_TO_BYTES)}`;
    assert.equal(
      new URL(loginHref(long), CONFIG.storefrontOrigin).searchParams.get(
        "return_to",
      ),
      ACCOUNT_PATH,
    );
    const allowed = `/account/orders/${"a".repeat(64)}`;
    assert.equal(
      new URL(loginHref(allowed), CONFIG.storefrontOrigin).searchParams.get(
        "return_to",
      ),
      allowed,
    );
    for (const hostile of [
      "//attacker.example/x",
      "/\\attacker.example/x",
      "https://attacker.example",
    ]) {
      assert.equal(
        new URL(loginHref(hostile), CONFIG.storefrontOrigin).searchParams.get(
          "return_to",
        ),
        ACCOUNT_PATH,
      );
    }
  });
});

describe("authorize callback", () => {
  it("redirects to the one fixed failure target when state is missing", async () => {
    const { result } = await runHandler(
      RUNTIME.handlers.authorize,
      new Request(`${CONFIG.storefrontOrigin}/account/authorize?code=abc`),
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, "/account?login=failed");
    assert.equal(new Headers(result.headers).get("cache-control"), "no-store");
  });

  it("pins the package guard that rejects pending login without an origin", async () => {
    let tokenExchangeCalls = 0;
    const guardedSession = createCustomerSession({
      shopId: CONFIG.shopId,
      customerAccountApiClientId: CONFIG.clientId,
      fetch: async () => {
        tokenExchangeCalls += 1;
        throw new Error("unexpected token exchange");
      },
    });
    const guardedHandlers = createCustomerAccountServerHandlers({
      customerSession: guardedSession,
      origin: CONFIG.storefrontOrigin,
      defaultPostLoginRedirectPathname: ACCOUNT_PATH,
      loginFailedRedirectPath: "/account?login=failed",
      postLogoutRedirectUri: "/",
    });
    const manager = await sessionManager();
    const state = "state-without-origin";
    await manager.setSessionItem("customerAccount", {
      pendingLogin: {
        state,
        nonce: "synthetic-nonce",
        codeVerifier: "synthetic-verifier",
        returnTo: ACCOUNT_PATH,
        createdAt: Date.now(),
      },
    });
    const request = new Request(
      `${CONFIG.storefrontOrigin}/account/authorize?code=synthetic&state=${state}`,
    );
    const result = await guardedHandlers.authorize({
      request,
      sessionManager: manager,
      requestContext: requestContext(request),
    });

    assert.ok(result.type === "redirect");
    assert.equal(result.location, "/account?login=failed");
    assert.equal(tokenExchangeCalls, 0);
  });

  it("rejects a mismatched state without describing the provider failure", async () => {
    const login = await runHandler(
      RUNTIME.handlers.login,
      new Request(`${CONFIG.storefrontOrigin}/account/login`),
    );
    assert.ok(login.result.type === "redirect");
    const cookie = sealedCookieFrom(login.result.headers);
    assert.ok(cookie);

    const { result } = await runHandler(
      RUNTIME.handlers.authorize,
      new Request(
        `${CONFIG.storefrontOrigin}/account/authorize?code=abc&state=not-the-session-state`,
      ),
      cookie,
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, "/account?login=failed");
    assert.ok(!result.location.includes("state"));
  });

  it("rejects an OAuth provider error callback the same way", async () => {
    const { result } = await runHandler(
      RUNTIME.handlers.authorize,
      new Request(
        `${CONFIG.storefrontOrigin}/account/authorize?error=access_denied&error_description=user+said+no`,
      ),
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, "/account?login=failed");
  });
});

describe("logout route", () => {
  it("is POST-only and same-origin, answering a generic no-store 403 otherwise", async () => {
    const hostileHeaders: HeadersInit[] = [
      {},
      { origin: "https://attacker.example" },
      { referer: "https://attacker.example/x" },
    ];
    for (const headers of hostileHeaders) {
      const { result } = await runHandler(
        RUNTIME.handlers.logout,
        new Request(`${CONFIG.storefrontOrigin}/account/logout`, {
          method: "POST",
          headers,
        }),
      );
      assert.ok(result.type === "error");
      assert.equal(result.status, 403);
      assert.equal(result.error.code, "forbidden");
      assert.equal(result.error.message, "Forbidden");
      const responseHeaders = new Headers(result.headers);
      assert.equal(responseHeaders.get("cache-control"), "no-store");
      assert.equal(responseHeaders.get("set-cookie"), null);
    }
  });

  it("clears the session and returns to the registered post-logout URI", async () => {
    const login = await runHandler(
      RUNTIME.handlers.login,
      new Request(`${CONFIG.storefrontOrigin}/account/login`),
    );
    assert.ok(login.result.type === "redirect");
    const cookie = sealedCookieFrom(login.result.headers);
    assert.ok(cookie);

    const { result, manager } = await runHandler(
      RUNTIME.handlers.logout,
      new Request(`${CONFIG.storefrontOrigin}/account/logout`, {
        method: "POST",
        headers: { origin: CONFIG.storefrontOrigin },
      }),
      cookie,
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, `${CONFIG.storefrontOrigin}/`);
    assert.equal(await manager.getSessionItem("customerAccount"), undefined);
    const setCookie = new Headers(result.headers).get("set-cookie");
    assert.ok(setCookie);
    assert.match(setCookie, /^forward_customer_account=;/);
    assert.match(setCookie, /Max-Age=0/);
  });
});

describe("refresh route", () => {
  it("returns to a same-origin target and never to a foreign one", async () => {
    const { result } = await runHandler(
      RUNTIME.handlers.refresh,
      new Request(
        `${CONFIG.storefrontOrigin}/account/refresh?return_to=${encodeURIComponent("https://attacker.example/x")}`,
      ),
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, ACCOUNT_PATH);
    assert.equal(new Headers(result.headers).get("cache-control"), "no-store");
  });

  it("carries one fixed marker inside the sanitized return target", () => {
    const href = refreshHref("/account/orders");
    const returnTo = new URL(href, CONFIG.storefrontOrigin).searchParams.get(
      "return_to",
    );
    assert.equal(returnTo, `/account/orders?${REFRESH_MARKER_PARAM}=1`);

    // The marker is set, never appended twice, so a second pass cannot loop.
    const again = new URL(
      refreshHref(returnTo ?? ""),
      CONFIG.storefrontOrigin,
    ).searchParams.get("return_to");
    assert.equal(again, `/account/orders?${REFRESH_MARKER_PARAM}=1`);
  });

  it("refuses to refresh a session that has no refresh token", async () => {
    const { result, manager } = await runHandler(
      RUNTIME.handlers.refresh,
      new Request(
        `${CONFIG.storefrontOrigin}/account/refresh?return_to=/account/orders`,
      ),
    );
    assert.ok(result.type === "redirect");
    assert.equal(result.location, "/account/orders");
    assert.equal(await manager.getSessionItem("customerAccount"), undefined);
  });
});

describe("response header semantics", () => {
  it("personalizes actual account pages and strips surrogate caching", async () => {
    configureProxyAccountEnvWithoutCatalog();
    const response = await proxy(
      new NextRequest(`${CONFIG.storefrontOrigin}/account`, {
        headers: {
          "cdn-cache-control": "max-age=600",
          "surrogate-control": "max-age=600",
        },
      }),
    );

    assert.equal(
      response.headers.get("cache-control"),
      "private, no-store, max-age=0, must-revalidate",
    );
    assert.equal(response.headers.get("cdn-cache-control"), null);
    assert.equal(response.headers.get("surrogate-control"), null);
  });

  it("runs account protocol routes without catalog credentials", async () => {
    configureProxyAccountEnvWithoutCatalog();
    const response = await proxy(
      new NextRequest(`${CONFIG.storefrontOrigin}/account/login`),
    );

    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("cache-control"),
      "private, no-store, max-age=0, must-revalidate",
    );
    const setCookie = response.headers.get("set-cookie");
    assert.ok(setCookie);
    assert.match(setCookie, /; HttpOnly;/i);
    assert.match(setCookie, /; SameSite=Lax/i);
  });

  it("binds every app redirect and OAuth callback to the configured origin", async () => {
    configureProxyAccountEnvWithoutCatalog();

    const login = await proxy(
      new NextRequest("https://attacker.example/account/login"),
    );
    assert.equal(login.status, 303);
    const providerLocation = new URL(login.headers.get("location") ?? "");
    assert.equal(
      providerLocation.searchParams.get("redirect_uri"),
      `${CONFIG.storefrontOrigin}/account/authorize`,
    );

    for (const path of [
      "/account/authorize?code=synthetic",
      "/account/refresh?return_to=%2Faccount",
    ]) {
      const response = await proxy(
        new NextRequest(`https://attacker.example${path}`),
      );
      assert.equal(response.status, 303);
      assert.equal(
        new URL(response.headers.get("location") ?? "").origin,
        CONFIG.storefrontOrigin,
      );
    }
  });

  it("returns no-store 405 responses with the exact allowed method", async () => {
    configureProxyAccountEnvWithoutCatalog();

    for (const [method, path, allowed] of [
      ["POST", "/account/login", "GET"],
      ["POST", "/account/authorize", "GET"],
      ["POST", "/account/refresh", "GET"],
      ["GET", "/account/logout", "POST"],
    ] as const) {
      const response = await proxy(
        new NextRequest(`https://attacker.example${path}`, { method }),
      );
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), allowed);
      assert.equal(
        response.headers.get("cache-control"),
        "private, no-store, max-age=0, must-revalidate",
      );
      assert.equal(response.headers.get("set-cookie"), null);
    }
  });

  it("marks a matched protocol response as personalized and strips CDN caching", async () => {
    const request = new Request(`${CONFIG.storefrontOrigin}/account/login`);
    const context = requestContext(request);
    const result = await RUNTIME.handlers.login({
      request,
      sessionManager: await sessionManager(),
      requestContext: context,
    });
    assert.ok(result.type === "redirect");

    const headers = new Headers(result.headers);
    headers.set("cdn-cache-control", "max-age=600");
    headers.set("surrogate-control", "max-age=600");
    context.applyResponseHeaders(headers);

    assert.equal(
      headers.get("cache-control"),
      "private, no-store, max-age=0, must-revalidate",
    );
    assert.equal(headers.get("cdn-cache-control"), null);
    assert.equal(headers.get("surrogate-control"), null);
  });

  it("preserves the package's pre-personalization no-store rejected logout", async () => {
    configureProxyAccountEnvWithoutCatalog();
    const response = await proxy(
      new NextRequest(`${CONFIG.storefrontOrigin}/account/logout`, {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      }),
    );

    assert.equal(response.status, 403);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(response.headers.get("vary"), null);
  });
});
