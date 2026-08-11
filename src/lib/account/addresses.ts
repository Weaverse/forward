/**
 * Customer Account address read + mutation core.
 *
 * This module is deliberately free of `next/*` imports so the whole decision
 * path — CSRF, authentication, schema validation, GraphQL outcome mapping — is
 * exercisable offline. `address-actions.ts` is the thin Server Action wrapper
 * that supplies request headers, the session, and the redirect/revalidate side
 * effects.
 *
 * Three rules hold everywhere below:
 *
 * - a mutation runs only for a currently usable access token, and never
 *   triggers an implicit refresh; no token means a redirect through the
 *   bounded refresh/login flow instead;
 * - the request is issued exactly once. After it leaves this process a retry
 *   could duplicate or re-apply the change, so an ambiguous failure is
 *   reported, never retried;
 * - the caller only ever sees one of three fixed strings. Provider messages,
 *   GraphQL extensions, tokens, and address PII never leave this file.
 */

import type { AccountSession } from "./account-view";
import { CustomerAccountRequestError } from "./account-view";
import { loginHref } from "./customer-account";
import {
  ACCOUNT_ADDRESS_CREATE_MUTATION,
  ACCOUNT_ADDRESS_DELETE_MUTATION,
  ACCOUNT_ADDRESS_LIMIT,
  ACCOUNT_ADDRESS_UPDATE_MUTATION,
  ACCOUNT_ADDRESSES_QUERY,
} from "./queries";

export const ADDRESSES_PATH = "/account/addresses";

/** The only intents the form boundary accepts. */
export const ADDRESS_INTENTS = [
  "create",
  "update",
  "delete",
  "default",
] as const;
export type AddressIntent = (typeof ADDRESS_INTENTS)[number];

/**
 * Every user-facing outcome, fixed at build time. Nothing here is derived from
 * a provider response.
 */
export const ADDRESS_ERROR_REJECTED =
  "That request could not be verified. Reload the page and try again.";
export const ADDRESS_ERROR_INVALID = "Check the address details and try again.";
export const ADDRESS_ERROR_FAILED =
  "That address change could not be completed. Reload the page to check before trying again.";

export type AddressActionResult =
  | { status: "success" }
  | { status: "redirect"; href: string }
  | { status: "error"; message: string };

/** The exact `CustomerAddressInput` subset Forward writes. */
const ADDRESS_FIELDS = [
  "firstName",
  "lastName",
  "company",
  "address1",
  "address2",
  "city",
  "zoneCode",
  "zip",
  "territoryCode",
  "phoneNumber",
] as const;
export type AddressField = (typeof ADDRESS_FIELDS)[number];

export type AddressFormValues = { [Field in AddressField]: string };

export interface AddressInput {
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  zoneCode: string | null;
  zip: string | null;
  territoryCode: string;
  phoneNumber: string | null;
}

export interface EditableAddress {
  id: string;
  /** Pre-formatted display lines, exactly as the read-only list renders them. */
  lines: readonly string[];
  isDefault: boolean;
  /** Current stored values, used to pre-fill the edit form. */
  values: AddressFormValues;
}

/** Field names accepted per intent. Anything else fails the whole submission. */
const ALLOWED_KEYS: Record<AddressIntent, readonly string[]> = {
  create: ["intent", "defaultAddress", ...ADDRESS_FIELDS],
  update: ["intent", "addressId", ...ADDRESS_FIELDS],
  delete: ["intent", "addressId"],
  default: ["intent", "addressId"],
};

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "address1",
  "city",
  "territoryCode",
] as const;

const DEFAULT_MAX_FIELD_LENGTH = 255;
const MAX_FIELD_LENGTHS: Partial<Record<AddressField, number>> = {
  zip: 32,
  phoneNumber: 32,
  territoryCode: 2,
};

// biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are exactly what is being rejected.
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const ADDRESS_ID_PATTERN =
  /^gid:\/\/shopify\/CustomerAddress\/\d{1,20}(\?[\w=&-]{1,80})?$/;
/** ISO 3166-1 alpha-2 only. The schema also takes alpha-3/numeric; we do not. */
const TERRITORY_CODE_PATTERN = /^[A-Z]{2}$/;
const ZONE_CODE_PATTERN = /^[A-Z0-9-]{1,12}$/;
const PHONE_NUMBER_PATTERN = /^\+[1-9]\d{1,14}$/;

export type ParsedAddressForm =
  | { intent: "create"; address: AddressInput; defaultAddress: boolean }
  | { intent: "update"; addressId: string; address: AddressInput }
  | { intent: "delete"; addressId: string }
  | { intent: "default"; addressId: string };

function isAddressIntent(value: string): value is AddressIntent {
  return (ADDRESS_INTENTS as readonly string[]).includes(value);
}

function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}

function readAddressId(values: Map<string, string>): string | null {
  const addressId = values.get("addressId");
  if (addressId === undefined || !ADDRESS_ID_PATTERN.test(addressId)) {
    return null;
  }
  return addressId;
}

function readAddressInput(values: Map<string, string>): AddressInput | null {
  for (const field of ADDRESS_FIELDS) {
    const value = values.get(field) ?? "";
    if (value.length > (MAX_FIELD_LENGTHS[field] ?? DEFAULT_MAX_FIELD_LENGTH)) {
      return null;
    }
  }

  const firstName = values.get("firstName") ?? "";
  const lastName = values.get("lastName") ?? "";
  const address1 = values.get("address1") ?? "";
  const city = values.get("city") ?? "";
  const territoryCode = (values.get("territoryCode") ?? "").toUpperCase();
  const zoneCode = (values.get("zoneCode") ?? "").toUpperCase();
  const zip = values.get("zip") ?? "";
  const phoneNumber = values.get("phoneNumber") ?? "";

  const required: Record<(typeof REQUIRED_FIELDS)[number], string> = {
    firstName,
    lastName,
    address1,
    city,
    territoryCode,
  };
  for (const field of REQUIRED_FIELDS) {
    if (required[field] === "") {
      return null;
    }
  }
  if (!TERRITORY_CODE_PATTERN.test(territoryCode)) {
    return null;
  }
  if (zoneCode !== "" && !ZONE_CODE_PATTERN.test(zoneCode)) {
    return null;
  }
  if (phoneNumber !== "" && !PHONE_NUMBER_PATTERN.test(phoneNumber)) {
    return null;
  }

  return {
    firstName,
    lastName,
    company: emptyToNull(values.get("company") ?? ""),
    address1,
    address2: emptyToNull(values.get("address2") ?? ""),
    city,
    zoneCode: emptyToNull(zoneCode),
    zip: emptyToNull(zip),
    territoryCode,
    phoneNumber: emptyToNull(phoneNumber),
  };
}

/**
 * Bounded schema for one address submission.
 *
 * Every rejection collapses to `null`: the caller renders one generic message,
 * so a probe cannot learn which field or which id it got wrong.
 */
export function parseAddressForm(formData: FormData): ParsedAddressForm | null {
  const values = new Map<string, string>();
  for (const [key, value] of formData.entries()) {
    // React owns the `$ACTION_*` fields on the no-JS submission path.
    if (key.startsWith("$")) {
      continue;
    }
    if (typeof value !== "string" || values.has(key)) {
      return null;
    }
    if (CONTROL_CHARACTERS.test(value)) {
      return null;
    }
    values.set(key, value.trim());
  }

  const intent = values.get("intent");
  if (intent === undefined || !isAddressIntent(intent)) {
    return null;
  }
  const allowed = ALLOWED_KEYS[intent];
  for (const key of values.keys()) {
    if (!allowed.includes(key)) {
      return null;
    }
  }

  if (intent === "create") {
    const defaultAddress = values.get("defaultAddress");
    if (defaultAddress !== undefined && defaultAddress !== "on") {
      return null;
    }
    const address = readAddressInput(values);
    return address === null
      ? null
      : { intent, address, defaultAddress: defaultAddress === "on" };
  }

  const addressId = readAddressId(values);
  if (addressId === null) {
    return null;
  }
  if (intent === "update") {
    const address = readAddressInput(values);
    return address === null ? null : { intent, addressId, address };
  }
  return { intent, addressId };
}

function refererOrigin(referer: string): string | null {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Exact configured-origin CSRF check, on top of the `SameSite=Lax` session
 * cookie. `Host`, `Forwarded`, and `X-Forwarded-*` are never consulted: a
 * proxy-controlled header must not be able to mint a same-origin claim. When
 * both `Origin` and `Referer` are present, both must match.
 */
export function isConfiguredOrigin(
  requestHeaders: Headers,
  origin: string,
): boolean {
  const declaredOrigin = requestHeaders.get("origin");
  const referer = requestHeaders.get("referer");
  if (declaredOrigin === null && referer === null) {
    return false;
  }
  if (declaredOrigin !== null && declaredOrigin !== origin) {
    return false;
  }
  if (referer !== null && refererOrigin(referer) !== origin) {
    return false;
  }
  return true;
}

function settle(
  errors: readonly unknown[] | undefined,
  userErrors: readonly unknown[] | undefined,
  applied: boolean,
): AddressActionResult {
  if (errors !== undefined || userErrors === undefined) {
    return { status: "error", message: ADDRESS_ERROR_FAILED };
  }
  if (userErrors.length > 0) {
    return { status: "error", message: ADDRESS_ERROR_INVALID };
  }
  if (!applied) {
    return { status: "error", message: ADDRESS_ERROR_FAILED };
  }
  return { status: "success" };
}

async function runAddressMutation(
  session: Extract<AccountSession, { status: "authenticated" }>,
  parsed: ParsedAddressForm,
): Promise<AddressActionResult> {
  const { accessToken } = session;
  try {
    switch (parsed.intent) {
      case "create": {
        const result = await session.client.graphql(
          ACCOUNT_ADDRESS_CREATE_MUTATION,
          {
            accessToken,
            variables: {
              address: parsed.address,
              defaultAddress: parsed.defaultAddress,
            },
          },
        );
        const payload = result.data?.customerAddressCreate;
        return settle(
          result.errors,
          payload?.userErrors,
          payload?.customerAddress != null,
        );
      }
      case "update":
      case "default": {
        // One document covers both: an edit sends the address and leaves the
        // default flag untouched, "make default" sends only the flag.
        const result = await session.client.graphql(
          ACCOUNT_ADDRESS_UPDATE_MUTATION,
          {
            accessToken,
            variables:
              parsed.intent === "update"
                ? { addressId: parsed.addressId, address: parsed.address }
                : { addressId: parsed.addressId, defaultAddress: true },
          },
        );
        const payload = result.data?.customerAddressUpdate;
        return settle(
          result.errors,
          payload?.userErrors,
          payload?.customerAddress != null,
        );
      }
      case "delete": {
        const result = await session.client.graphql(
          ACCOUNT_ADDRESS_DELETE_MUTATION,
          { accessToken, variables: { addressId: parsed.addressId } },
        );
        const payload = result.data?.customerAddressDelete;
        return settle(
          result.errors,
          payload?.userErrors,
          payload?.deletedAddressId != null,
        );
      }
    }
  } catch {
    // Transport failure or an ambiguous timeout: the mutation may already have
    // been applied upstream. Report it and stop; never re-issue.
    return { status: "error", message: ADDRESS_ERROR_FAILED };
  }
}

/**
 * Runs one address submission end to end.
 *
 * Order matters: an unverified origin and an unauthenticated caller are both
 * turned away before the submitted payload is inspected at all.
 */
export async function performAddressAction(options: {
  session: AccountSession;
  requestHeaders: Headers;
  /** The configured storefront origin, never a request-derived host. */
  origin: string;
  formData: FormData;
}): Promise<AddressActionResult> {
  const { session, requestHeaders, origin, formData } = options;

  if (!isConfiguredOrigin(requestHeaders, origin)) {
    return { status: "error", message: ADDRESS_ERROR_REJECTED };
  }
  if (session.status === "needs-refresh") {
    return { status: "redirect", href: session.href };
  }
  if (session.status !== "authenticated") {
    return { status: "redirect", href: loginHref(ADDRESSES_PATH) };
  }

  const parsed = parseAddressForm(formData);
  if (parsed === null) {
    return { status: "error", message: ADDRESS_ERROR_INVALID };
  }
  return runAddressMutation(session, parsed);
}

/** Reads the saved addresses with the field values an edit form needs. */
export async function readAccountAddresses(
  session: Extract<AccountSession, { status: "authenticated" }>,
): Promise<readonly EditableAddress[]> {
  const result = await session.client.graphql(ACCOUNT_ADDRESSES_QUERY, {
    accessToken: session.accessToken,
    variables: { addressCount: ACCOUNT_ADDRESS_LIMIT },
  });
  if (result.errors !== undefined || result.data === null) {
    throw new CustomerAccountRequestError();
  }

  const { customer } = result.data;
  const defaultAddressId = customer.defaultAddress?.id ?? null;
  return customer.addresses.nodes.map((address) => ({
    id: address.id,
    lines: address.formatted,
    isDefault: address.id === defaultAddressId,
    values: {
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      company: address.company ?? "",
      address1: address.address1 ?? "",
      address2: address.address2 ?? "",
      city: address.city ?? "",
      zoneCode: address.zoneCode ?? "",
      zip: address.zip ?? "",
      territoryCode: address.territoryCode ?? "",
      phoneNumber: address.phoneNumber ?? "",
    },
  }));
}
