import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import {
  type AccountSession,
  CustomerAccountRequestError,
  formatAccountMoney,
  formatStatusLabel,
  hasRefreshMarker,
  readAccountOrder,
  readAccountProfile,
} from "../src/lib/account/account-view.ts";
import { getCustomerAccountRuntime } from "../src/lib/account/customer-account.ts";
import {
  ACCOUNT_ORDER_LOOKUP_QUERY,
  ACCOUNT_ORDER_QUERY,
  ACCOUNT_PROFILE_QUERY,
} from "../src/lib/account/queries.ts";

const ACCESS_TOKEN = "shcat_live_access_token_value";

type AuthenticatedSession = Extract<
  AccountSession,
  { status: "authenticated" }
>;
type GraphqlResponse = { data: unknown; errors?: unknown[] };
type GraphqlOptions = { accessToken: unknown; variables?: unknown };

function fakeSession(
  respond: (document: unknown, options: GraphqlOptions) => GraphqlResponse,
): AuthenticatedSession {
  return {
    status: "authenticated",
    accessToken: ACCESS_TOKEN,
    client: {
      apiUrl: "https://shopify.com/1/account/customer/api/2026-07/graphql",
      graphql: async (document: unknown, options: GraphqlOptions) => ({
        ...respond(document, options),
        headers: new Headers(),
      }),
    },
  } as unknown as AuthenticatedSession;
}

const PROFILE_DATA = {
  customer: {
    id: "gid://shopify/Customer/1",
    firstName: "Rowan",
    lastName: "Hale",
    displayName: "Rowan Hale",
    emailAddress: { emailAddress: "rowan@example.com" },
    defaultAddress: {
      id: "gid://shopify/CustomerAddress/2",
      formatted: ["Rowan Hale", "14 Fell Road", "Keswick CA12 5AB"],
    },
    addresses: {
      nodes: [
        {
          id: "gid://shopify/CustomerAddress/2",
          formatted: ["Rowan Hale", "14 Fell Road", "Keswick CA12 5AB"],
        },
        {
          id: "gid://shopify/CustomerAddress/3",
          formatted: ["Rowan Hale", "Unit 6, Long Light Works"],
        },
      ],
    },
    orders: {
      nodes: [
        {
          id: "gid://shopify/Order/1001",
          name: "#1001",
          number: 1001,
          processedAt: "2026-07-21T09:30:00Z",
          financialStatus: "PAID",
          fulfillmentStatus: "PARTIALLY_FULFILLED",
          totalPrice: { amount: "390.0", currencyCode: "USD" },
        },
      ],
    },
  },
};

const ORDER_LOOKUP_DATA = {
  customer: {
    orders: {
      nodes: [{ id: "gid://shopify/Order/1001", number: 1001 }],
    },
  },
};

const ORDER_DATA = {
  order: {
    id: "gid://shopify/Order/1001",
    name: "#1001",
    number: 1001,
    processedAt: "2026-07-21T09:30:00Z",
    financialStatus: "PAID",
    fulfillmentStatus: "FULFILLED",
    totalPrice: { amount: "390.0", currencyCode: "USD" },
    subtotal: { amount: "390.0", currencyCode: "USD" },
    totalShipping: { amount: "0.0", currencyCode: "USD" },
    totalTax: null,
    shippingAddress: {
      id: "gid://shopify/CustomerAddress/2",
      formatted: ["Rowan Hale", "14 Fell Road"],
    },
    lineItems: {
      nodes: [
        {
          id: "gid://shopify/LineItem/1",
          title: "Weatherline Shell",
          variantTitle: "Charcoal / M",
          quantity: 1,
          totalPrice: { amount: "248.0", currencyCode: "USD" },
        },
      ],
    },
  },
};

function respondWithFixtures(document: unknown): GraphqlResponse {
  if (document === ACCOUNT_PROFILE_QUERY) {
    return { data: PROFILE_DATA };
  }
  if (document === ACCOUNT_ORDER_LOOKUP_QUERY) {
    return { data: ORDER_LOOKUP_DATA };
  }
  if (document === ACCOUNT_ORDER_QUERY) {
    return { data: ORDER_DATA };
  }
  throw new Error("unexpected document");
}

describe("account formatting", () => {
  it("formats Customer Account decimal money strings", () => {
    assert.equal(
      formatAccountMoney({ amount: "390.0", currencyCode: "USD" }),
      "$390",
    );
    assert.equal(
      formatAccountMoney({ amount: "12.50", currencyCode: "USD" }),
      "$12.50",
    );
    assert.equal(
      formatAccountMoney({ amount: "not-a-number", currencyCode: "USD" }),
      "—",
    );
  });

  it("renders enum statuses as sentence case", () => {
    assert.equal(
      formatStatusLabel("PARTIALLY_FULFILLED"),
      "Partially fulfilled",
    );
    assert.equal(formatStatusLabel("FULFILLED"), "Fulfilled");
    assert.equal(formatStatusLabel(null), "Processing");
  });

  it("detects the one fixed refresh marker", () => {
    assert.equal(hasRefreshMarker({}), false);
    assert.equal(hasRefreshMarker({ account_refresh: "1" }), true);
    assert.equal(hasRefreshMarker({ account_refresh: ["1"] }), true);
    assert.equal(hasRefreshMarker({ account_refresh: "yes" }), false);
  });
});

describe("readAccountProfile", () => {
  it("maps the typed profile, addresses, and orders", async () => {
    const profile = await readAccountProfile(
      fakeSession(respondWithFixtures),
      5,
    );
    assert.equal(profile.displayName, "Rowan Hale");
    assert.equal(profile.emailAddress, "rowan@example.com");
    assert.deepEqual(
      profile.addresses.map((address) => address.isDefault),
      [true, false],
    );
    assert.deepEqual(profile.orders, [
      {
        number: 1001,
        name: "#1001",
        href: "/account/orders/1001",
        processedAt: "2026-07-21T09:30:00Z",
        status: "Partially fulfilled",
        total: "$390",
      },
    ]);
  });

  it("never carries the access token into a view model", async () => {
    const profile = await readAccountProfile(
      fakeSession(respondWithFixtures),
      5,
    );
    assert.ok(!JSON.stringify(profile).includes(ACCESS_TOKEN));
  });

  it("fails generically on a GraphQL error envelope", async () => {
    const session = fakeSession(() => ({
      data: null,
      errors: [{ message: "Customer not found", extensions: { code: "X" } }],
    }));
    await assert.rejects(readAccountProfile(session, 5), (error: unknown) => {
      assert.ok(error instanceof CustomerAccountRequestError);
      assert.ok(!error.message.includes("Customer not found"));
      assert.ok(!error.message.includes("extensions"));
      return true;
    });
  });
});

describe("readAccountOrder", () => {
  it("maps one order belonging to the customer", async () => {
    const order = await readAccountOrder(
      fakeSession(respondWithFixtures),
      "1001",
    );
    assert.ok(order);
    assert.equal(order.name, "#1001");
    assert.equal(order.status, "Fulfilled");
    assert.equal(order.total, "$390");
    assert.equal(order.subtotal, "$390");
    assert.equal(order.tax, null);
    assert.deepEqual(order.shippingAddress, ["Rowan Hale", "14 Fell Road"]);
    assert.deepEqual(order.lines, [
      {
        id: "gid://shopify/LineItem/1",
        title: "Weatherline Shell",
        variantTitle: "Charcoal / M",
        quantity: 1,
        total: "$248",
      },
    ]);
    assert.ok(!JSON.stringify(order).includes(ACCESS_TOKEN));
  });

  it("uses an exact customer-scoped lookup before the order detail query", async () => {
    const calls: Array<{ document: unknown; options: GraphqlOptions }> = [];
    const session = fakeSession((document, options) => {
      calls.push({ document, options });
      return respondWithFixtures(document);
    });

    assert.ok(await readAccountOrder(session, "1001"));
    assert.equal(calls.length, 2);
    assert.equal(calls[0]?.document, ACCOUNT_ORDER_LOOKUP_QUERY);
    assert.deepEqual(calls[0]?.options.variables, {
      query: "order_number:1001",
    });
    assert.equal(calls[1]?.document, ACCOUNT_ORDER_QUERY);
    assert.deepEqual(calls[1]?.options.variables, {
      orderId: "gid://shopify/Order/1001",
      lineCount: 50,
    });
  });

  it("fails closed on an ambiguous customer-scoped order match", async () => {
    let calls = 0;
    const session = fakeSession(() => {
      calls += 1;
      return {
        data: {
          customer: {
            orders: {
              nodes: [
                { id: "gid://shopify/Order/1001", number: 1001 },
                { id: "gid://shopify/Order/2001", number: 1001 },
              ],
            },
          },
        },
      };
    });

    assert.equal(await readAccountOrder(session, "1001"), null);
    assert.equal(calls, 1);
  });

  it("maps malformed, foreign, and declined order ids to the same not-found", async () => {
    const session = fakeSession(respondWithFixtures);
    for (const orderId of [
      "",
      "abc",
      "gid://shopify/Order/1001",
      "1001-",
      "9999",
    ]) {
      assert.equal(await readAccountOrder(session, orderId), null);
    }

    const declined = fakeSession((document) =>
      document === ACCOUNT_ORDER_LOOKUP_QUERY
        ? { data: ORDER_LOOKUP_DATA }
        : { data: { order: null } },
    );
    assert.equal(await readAccountOrder(declined, "1001"), null);

    const errored = fakeSession((document) =>
      document === ACCOUNT_ORDER_LOOKUP_QUERY
        ? { data: ORDER_LOOKUP_DATA }
        : { data: null, errors: [{ message: "Access denied" }] },
    );
    assert.equal(await readAccountOrder(errored, "1001"), null);
  });
});

describe("disabled account configuration", () => {
  it("resolves to no runtime at all", () => {
    assert.equal(getCustomerAccountRuntime({}), null);
  });

  it("renders no auth affordance outside the account boundary", async () => {
    for (const file of [
      "src/components/site-header.tsx",
      "src/components/site-footer.tsx",
    ]) {
      const source = await readFile(path.join(process.cwd(), file), "utf8");
      assert.ok(!source.includes("/account/login"), `${file} links to login`);
      assert.ok(!source.includes("/account/logout"), `${file} links to logout`);
    }
  });
});

describe("account route segment configuration", () => {
  it("keeps every account page dynamic, no-store, and never statically enumerated", async () => {
    for (const route of [
      "src/app/account/page.tsx",
      "src/app/account/orders/page.tsx",
      "src/app/account/orders/[orderId]/page.tsx",
      "src/app/account/addresses/page.tsx",
    ]) {
      const source = await readFile(path.join(process.cwd(), route), "utf8");
      assert.match(source, /export const dynamic = "force-dynamic";/, route);
      assert.match(
        source,
        /export const fetchCache = "force-no-store";/,
        route,
      );
      assert.doesNotMatch(source, /generateStaticParams/, route);
      assert.doesNotMatch(source, /export const revalidate/, route);
      assert.doesNotMatch(source, /dynamicParams/, route);
    }
  });
});
