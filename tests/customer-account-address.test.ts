import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import type { AccountSession } from "../src/lib/account/account-view.ts";
import { CustomerAccountRequestError } from "../src/lib/account/account-view.ts";
import {
  ADDRESS_ERROR_FAILED,
  ADDRESS_ERROR_INVALID,
  ADDRESS_ERROR_REJECTED,
  isConfiguredOrigin,
  performAddressAction,
  readAccountAddresses,
} from "../src/lib/account/addresses.ts";
import {
  ACCOUNT_ADDRESS_CREATE_MUTATION,
  ACCOUNT_ADDRESS_DELETE_MUTATION,
  ACCOUNT_ADDRESS_UPDATE_MUTATION,
  ACCOUNT_ADDRESSES_QUERY,
} from "../src/lib/account/queries.ts";

const ORIGIN = "https://forward-sandy.vercel.app";
const ACCESS_TOKEN = "shcat_live_access_token_value";
const ADDRESS_ID = "gid://shopify/CustomerAddress/2?model_name=CustomerAddress";

type AuthenticatedSession = Extract<
  AccountSession,
  { status: "authenticated" }
>;
type GraphqlResponse = { data: unknown; errors?: unknown[] };
interface GraphqlCall {
  document: unknown;
  variables: unknown;
  accessToken: unknown;
}

function recordingSession(respond: (call: GraphqlCall) => GraphqlResponse): {
  session: AuthenticatedSession;
  calls: GraphqlCall[];
} {
  const calls: GraphqlCall[] = [];
  const session = {
    status: "authenticated",
    accessToken: ACCESS_TOKEN,
    client: {
      apiUrl: "https://shopify.com/1/account/customer/api/2026-07/graphql",
      graphql: async (
        document: unknown,
        options: { accessToken: unknown; variables?: unknown },
      ) => {
        const call = {
          document,
          variables: options.variables,
          accessToken: options.accessToken,
        };
        calls.push(call);
        return { ...respond(call), headers: new Headers() };
      },
    },
  } as unknown as AuthenticatedSession;
  return { session, calls };
}

/** A session whose client fails the test if any mutation is ever attempted. */
function forbiddenSession(status: "signed-out"): AccountSession;
function forbiddenSession(
  status: "needs-refresh",
  href: string,
): AccountSession;
function forbiddenSession(
  status: "signed-out" | "needs-refresh",
  href = "",
): AccountSession {
  const client = {
    apiUrl: "",
    graphql: () => {
      throw new Error("a mutation must not be attempted");
    },
  };
  return status === "signed-out"
    ? ({ status, client } as unknown as AccountSession)
    : ({ status, href, client } as unknown as AccountSession);
}

function sameOriginHeaders(): Headers {
  return new Headers({
    origin: ORIGIN,
    referer: `${ORIGIN}/account/addresses`,
  });
}

const VALID_ADDRESS = {
  firstName: "Rowan",
  lastName: "Hale",
  company: "",
  address1: "14 Fell Road",
  address2: "",
  city: "Keswick",
  zoneCode: "cu",
  zip: "CA12 5AB",
  territoryCode: "gb",
  phoneNumber: "+441234567890",
} as const;

function addressFormData(
  overrides: Record<string, string> = {},
  removed: readonly string[] = [],
): FormData {
  const formData = new FormData();
  const entries: Record<string, string> = { ...VALID_ADDRESS, ...overrides };
  for (const [key, value] of Object.entries(entries)) {
    if (!removed.includes(key)) {
      formData.set(key, value);
    }
  }
  return formData;
}

function createForm(overrides: Record<string, string> = {}): FormData {
  return addressFormData({ intent: "create", ...overrides });
}

async function run(
  session: AccountSession,
  formData: FormData,
  requestHeaders: Headers = sameOriginHeaders(),
) {
  return performAddressAction({
    session,
    requestHeaders,
    origin: ORIGIN,
    formData,
  });
}

describe("address CSRF boundary", () => {
  it("accepts only the exact configured origin", () => {
    assert.equal(isConfiguredOrigin(sameOriginHeaders(), ORIGIN), true);
    assert.equal(
      isConfiguredOrigin(new Headers({ origin: ORIGIN }), ORIGIN),
      true,
    );
    assert.equal(
      isConfiguredOrigin(
        new Headers({ referer: `${ORIGIN}/account/addresses` }),
        ORIGIN,
      ),
      true,
    );
  });

  it("rejects a foreign, absent, look-alike, or mismatched origin", () => {
    const rejected = [
      new Headers(),
      new Headers({ origin: "https://evil.example" }),
      new Headers({ origin: `${ORIGIN}.evil.example` }),
      new Headers({ origin: ORIGIN.replace("https", "http") }),
      new Headers({ referer: "https://evil.example/account/addresses" }),
      new Headers({ referer: "not a url" }),
      // Origin matches but Referer does not: both must agree.
      new Headers({ origin: ORIGIN, referer: "https://evil.example/x" }),
    ];
    for (const requestHeaders of rejected) {
      assert.equal(
        isConfiguredOrigin(requestHeaders, ORIGIN),
        false,
        JSON.stringify([...requestHeaders]),
      );
    }
  });

  it("never treats Host or forwarded headers as an origin claim", () => {
    const forged = new Headers({
      host: "forward-sandy.vercel.app",
      "x-forwarded-host": "forward-sandy.vercel.app",
      "x-forwarded-proto": "https",
      forwarded: `host=forward-sandy.vercel.app;proto=https`,
    });
    assert.equal(isConfiguredOrigin(forged, ORIGIN), false);
  });

  it("refuses the mutation before any GraphQL request", async () => {
    const { session, calls } = recordingSession(() => ({ data: {} }));
    const result = await run(
      session,
      createForm(),
      new Headers({ origin: "https://evil.example" }),
    );
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_REJECTED,
    });
    assert.equal(calls.length, 0);
  });
});

describe("address authentication boundary", () => {
  it("redirects a signed-out caller to login without mutating", async () => {
    const result = await run(forbiddenSession("signed-out"), createForm());
    assert.deepEqual(result, {
      status: "redirect",
      href: "/account/login?return_to=%2Faccount%2Faddresses",
    });
  });

  it("redirects an expired session to the bounded refresh flow", async () => {
    const href = "/account/refresh?return_to=%2Faccount%2Faddresses";
    const result = await run(
      forbiddenSession("needs-refresh", href),
      createForm(),
    );
    assert.deepEqual(result, { status: "redirect", href });
  });

  it("never implicitly refreshes: the action only reads a usable token", async () => {
    const source = await readFile(
      path.join(process.cwd(), "src/lib/account/address-actions.ts"),
      "utf8",
    );
    assert.doesNotMatch(source, /getOrRefreshAccessToken/);
    assert.doesNotMatch(source, /refreshed: true/);
  });
});

describe("address schema validation", () => {
  const rejected: Record<string, FormData> = {
    "missing intent": addressFormData(),
    "unknown intent": createForm({ intent: "upsert" }),
    "unknown field": createForm({ note: "drop table" }),
    // A delete accepts the intent and the id, nothing else.
    "address field on delete": addressFormData(
      { intent: "delete", addressId: ADDRESS_ID },
      Object.keys(VALID_ADDRESS).filter((key) => key !== "city"),
    ),
    "missing required field": addressFormData({ intent: "create" }, [
      "address1",
    ]),
    "blank required field": createForm({ city: "   " }),
    "control character": createForm({ address1: "14 Fell\u0007 Road" }),
    "newline injection": createForm({ city: "Keswick\nSet-Cookie: x=1" }),
    "oversized field": createForm({ address1: "x".repeat(256) }),
    "oversized zip": createForm({ zip: "9".repeat(33) }),
    "malformed territory code": createForm({ territoryCode: "GBR" }),
    "malformed zone code": createForm({ zoneCode: "not a zone" }),
    "malformed phone": createForm({ phoneNumber: "0800 555 111" }),
    "addressId on create": createForm({ addressId: ADDRESS_ID }),
    "missing addressId on update": addressFormData({ intent: "update" }),
    "malformed addressId": addressFormData({
      intent: "delete",
      addressId: "gid://shopify/Order/2",
    }),
    "numeric addressId": addressFormData({
      intent: "delete",
      addressId: "2",
    }),
    "traversal addressId": addressFormData({
      intent: "default",
      addressId: "gid://shopify/CustomerAddress/2/../3",
    }),
    "unexpected checkbox value": createForm({ defaultAddress: "true" }),
  };

  for (const [name, formData] of Object.entries(rejected)) {
    it(`rejects ${name} without a GraphQL request`, async () => {
      const { session, calls } = recordingSession(() => ({ data: {} }));
      const result = await run(session, formData);
      assert.deepEqual(result, {
        status: "error",
        message: ADDRESS_ERROR_INVALID,
      });
      assert.equal(calls.length, 0);
    });
  }

  it("ignores the React-owned $ACTION fields on the no-JS path", async () => {
    const formData = createForm();
    formData.set("$ACTION_ID_1c0ffee", "");
    formData.set("$ACTION_KEY", "k1234");
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressCreate: {
          customerAddress: { id: ADDRESS_ID },
          userErrors: [],
        },
      },
    }));
    assert.deepEqual(await run(session, formData), { status: "success" });
    assert.equal(calls.length, 1);
  });

  it("rejects a file upload smuggled into an address field", async () => {
    const formData = createForm();
    formData.set("address1", new File(["x"], "a.txt"));
    const { session, calls } = recordingSession(() => ({ data: {} }));
    const result = await run(session, formData);
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_INVALID,
    });
    assert.equal(calls.length, 0);
  });
});

describe("address mutations", () => {
  it("creates with the exact document and normalized variables", async () => {
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressCreate: {
          customerAddress: { id: ADDRESS_ID },
          userErrors: [],
        },
      },
    }));
    const result = await run(session, createForm({ defaultAddress: "on" }));

    assert.deepEqual(result, { status: "success" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.document, ACCOUNT_ADDRESS_CREATE_MUTATION);
    assert.equal(calls[0]?.accessToken, ACCESS_TOKEN);
    assert.deepEqual(calls[0]?.variables, {
      address: {
        firstName: "Rowan",
        lastName: "Hale",
        company: null,
        address1: "14 Fell Road",
        address2: null,
        city: "Keswick",
        zoneCode: "CU",
        zip: "CA12 5AB",
        territoryCode: "GB",
        phoneNumber: "+441234567890",
      },
      defaultAddress: true,
    });
  });

  it("creates a non-default address when the checkbox is absent", async () => {
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressCreate: {
          customerAddress: { id: ADDRESS_ID },
          userErrors: [],
        },
      },
    }));
    assert.deepEqual(await run(session, createForm()), { status: "success" });
    const variables = calls[0]?.variables as { defaultAddress: boolean };
    assert.equal(variables.defaultAddress, false);
  });

  it("updates without touching the default flag", async () => {
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressUpdate: {
          customerAddress: { id: ADDRESS_ID },
          userErrors: [],
        },
      },
    }));
    const result = await run(
      session,
      addressFormData({ intent: "update", addressId: ADDRESS_ID }),
    );

    assert.deepEqual(result, { status: "success" });
    assert.equal(calls[0]?.document, ACCOUNT_ADDRESS_UPDATE_MUTATION);
    const variables = calls[0]?.variables as Record<string, unknown>;
    assert.equal(variables.addressId, ADDRESS_ID);
    assert.equal("defaultAddress" in variables, false);
    assert.equal(
      (variables.address as { address1: string }).address1,
      "14 Fell Road",
    );
  });

  it("sets the default address through the update mutation only", async () => {
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressUpdate: {
          customerAddress: { id: ADDRESS_ID },
          userErrors: [],
        },
      },
    }));
    const result = await run(
      session,
      addressFormData(
        { intent: "default", addressId: ADDRESS_ID },
        Object.keys(VALID_ADDRESS),
      ),
    );

    assert.deepEqual(result, { status: "success" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.document, ACCOUNT_ADDRESS_UPDATE_MUTATION);
    assert.deepEqual(calls[0]?.variables, {
      addressId: ADDRESS_ID,
      defaultAddress: true,
    });
  });

  it("deletes with the exact document and only the address id", async () => {
    const { session, calls } = recordingSession(() => ({
      data: {
        customerAddressDelete: {
          deletedAddressId: ADDRESS_ID,
          userErrors: [],
        },
      },
    }));
    const result = await run(
      session,
      addressFormData(
        { intent: "delete", addressId: ADDRESS_ID },
        Object.keys(VALID_ADDRESS),
      ),
    );

    assert.deepEqual(result, { status: "success" });
    assert.equal(calls[0]?.document, ACCOUNT_ADDRESS_DELETE_MUTATION);
    assert.deepEqual(calls[0]?.variables, { addressId: ADDRESS_ID });
  });
});

describe("address failure handling", () => {
  it("maps GraphQL userErrors to one generic message", async () => {
    const { session } = recordingSession(() => ({
      data: {
        customerAddressCreate: {
          customerAddress: null,
          userErrors: [
            { code: "INVALID", field: ["address", "zip"] },
            { code: "TAKEN", field: null },
          ],
        },
      },
    }));
    const result = await run(session, createForm());
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_INVALID,
    });
  });

  it("maps a GraphQL error envelope without leaking it", async () => {
    const { session } = recordingSession(() => ({
      data: null,
      errors: [
        {
          message: "Customer address 2 belongs to another customer",
          extensions: { code: "UNAUTHORIZED", requestId: "abc-123" },
        },
      ],
    }));
    const result = await run(session, createForm());
    assert.equal(result.status, "error");
    const serialized = JSON.stringify(result);
    assert.equal(serialized.includes("another customer"), false);
    assert.equal(serialized.includes("UNAUTHORIZED"), false);
    assert.equal(serialized.includes("abc-123"), false);
    assert.equal(serialized.includes("extensions"), false);
  });

  it("treats a null payload as a failure, not a success", async () => {
    const { session } = recordingSession(() => ({
      data: { customerAddressDelete: null },
    }));
    const result = await run(
      session,
      addressFormData(
        { intent: "delete", addressId: ADDRESS_ID },
        Object.keys(VALID_ADDRESS),
      ),
    );
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_FAILED,
    });
  });

  it("never retries after the request has started", async () => {
    let attempts = 0;
    const { session } = recordingSession(() => {
      attempts += 1;
      throw new TypeError("fetch failed");
    });
    const result = await run(session, createForm());
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_FAILED,
    });
    assert.equal(attempts, 1);
  });

  it("never retries after an ambiguous timeout", async () => {
    let attempts = 0;
    const { session } = recordingSession(() => {
      attempts += 1;
      const error = new Error("The operation was aborted due to timeout");
      error.name = "TimeoutError";
      throw error;
    });
    const result = await run(
      session,
      addressFormData({ intent: "update", addressId: ADDRESS_ID }),
    );
    assert.deepEqual(result, {
      status: "error",
      message: ADDRESS_ERROR_FAILED,
    });
    assert.equal(attempts, 1);
  });

  it("never carries the access token into any outcome", async () => {
    const outcomes = [
      await run(
        recordingSession(() => ({
          data: {
            customerAddressCreate: {
              customerAddress: { id: ADDRESS_ID },
              userErrors: [],
            },
          },
        })).session,
        createForm(),
      ),
      await run(
        recordingSession(() => {
          throw new Error(`token ${ACCESS_TOKEN} rejected`);
        }).session,
        createForm(),
      ),
      await run(
        recordingSession(() => ({
          data: null,
          errors: [{ message: `bad token ${ACCESS_TOKEN}` }],
        })).session,
        createForm(),
      ),
      await run(forbiddenSession("signed-out"), createForm()),
    ];
    for (const outcome of outcomes) {
      assert.equal(JSON.stringify(outcome).includes(ACCESS_TOKEN), false);
    }
  });
});

describe("readAccountAddresses", () => {
  const ADDRESSES_DATA = {
    customer: {
      defaultAddress: { id: ADDRESS_ID },
      addresses: {
        nodes: [
          {
            id: ADDRESS_ID,
            firstName: "Rowan",
            lastName: "Hale",
            company: null,
            address1: "14 Fell Road",
            address2: null,
            city: "Keswick",
            zoneCode: "CU",
            zip: "CA12 5AB",
            territoryCode: "GB",
            phoneNumber: null,
            formatted: ["Rowan Hale", "14 Fell Road", "Keswick CA12 5AB"],
          },
          {
            id: "gid://shopify/CustomerAddress/3",
            firstName: "Rowan",
            lastName: "Hale",
            company: "Long Light Works",
            address1: "Unit 6",
            address2: null,
            city: "Kendal",
            zoneCode: null,
            zip: null,
            territoryCode: "GB",
            phoneNumber: null,
            formatted: ["Rowan Hale", "Unit 6, Long Light Works"],
          },
        ],
      },
    },
  };

  it("reads the exact document and maps editable values", async () => {
    const { session, calls } = recordingSession(() => ({
      data: ADDRESSES_DATA,
    }));
    const addresses = await readAccountAddresses(session);

    assert.equal(calls[0]?.document, ACCOUNT_ADDRESSES_QUERY);
    assert.deepEqual(calls[0]?.variables, { addressCount: 10 });
    assert.deepEqual(
      addresses.map((address) => address.isDefault),
      [true, false],
    );
    assert.deepEqual(addresses[0]?.values, {
      firstName: "Rowan",
      lastName: "Hale",
      company: "",
      address1: "14 Fell Road",
      address2: "",
      city: "Keswick",
      zoneCode: "CU",
      zip: "CA12 5AB",
      territoryCode: "GB",
      phoneNumber: "",
    });
    assert.equal(JSON.stringify(addresses).includes(ACCESS_TOKEN), false);
  });

  it("fails generically on a GraphQL error envelope", async () => {
    const { session } = recordingSession(() => ({
      data: null,
      errors: [{ message: "Customer not found", extensions: { code: "X" } }],
    }));
    await assert.rejects(readAccountAddresses(session), (error: unknown) => {
      assert.ok(error instanceof CustomerAccountRequestError);
      assert.equal(error.message.includes("Customer not found"), false);
      return true;
    });
  });
});

describe("address action boundary", () => {
  it("keeps the writable mutation surface behind one Server Action", async () => {
    const source = await readFile(
      path.join(process.cwd(), "src/lib/account/address-actions.ts"),
      "utf8",
    );
    assert.match(source, /^"use server";/);
    // Success is the only thing that revalidates or redirects to the one
    // fixed path; there is no dynamic redirect target on a failure.
    assert.match(source, /revalidatePath\(ADDRESSES_PATH\)/);
    assert.match(source, /redirect\(ADDRESSES_PATH\)/);
    assert.match(source, /session\.commitSession\(\)/);
    assert.ok(
      source.indexOf("session.commitSession()") <
        source.indexOf("performAddressAction("),
      "session commit guard must run before the Shopify mutation",
    );
    assert.doesNotMatch(source, /searchParams|error=|\?message=/);
  });

  it("never reads a request-derived origin", async () => {
    for (const file of [
      "src/lib/account/address-actions.ts",
      "src/lib/account/addresses.ts",
    ]) {
      const source = await readFile(path.join(process.cwd(), file), "utf8");
      assert.doesNotMatch(
        source,
        /get\(\s*["'`](host|forwarded|x-forwarded[\w-]*)["'`]\s*\)/i,
        file,
      );
    }
  });
});
