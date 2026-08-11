/**
 * Authenticated-encrypted Customer Account session cookie.
 *
 * The cookie carries an AES-256-GCM envelope over a JSON payload. Every commit
 * uses a fresh 96-bit nonce and a fresh generation identifier, so no stable
 * pre-login identifier survives authentication and a replayed older cookie is
 * distinguishable. The envelope version is authenticated as additional data.
 *
 * Any tampering, truncation, version change, or expiry makes the value open as
 * `null` — the caller then behaves as if there were no session at all. Size
 * bounds reject before emission and never truncate, because a truncated
 * authenticated ciphertext is unrecoverable rather than merely shorter.
 */

const COOKIE_NAME = "forward_customer_account";
const ENVELOPE_VERSION = "v1";
const NONCE_BYTES = 12;
const GENERATION_BYTES = 16;
const HKDF_INFO = "forward-customer-account-session-v1";
const SET_COOKIE_PREFIX = "Set-Cookie: ";

/** Narrowly bounded session lifetime. Re-issued on every commit. */
export const SESSION_MAX_AGE_IN_SECONDS = 86_400;

/** Encoded cookie value bound. */
export const MAX_COOKIE_VALUE_BYTES = 3_600;

/** Complete `Set-Cookie` line bound. */
export const MAX_SET_COOKIE_BYTES = 4_096;

export { COOKIE_NAME as CUSTOMER_ACCOUNT_COOKIE_NAME };

export type SessionData = Record<string, unknown>;

export interface CookieOptions {
  /** `Secure` is required in Production and omitted for plain-HTTP local dev. */
  secure: boolean;
}

/** Size-bound violation. Carries no session content. */
export class CustomerAccountSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerAccountSessionError";
  }
}

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function randomBase64Url(byteLength: number): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/**
 * Derives the AES-GCM key from the configured secret with HKDF-SHA256, so the
 * raw secret is never used directly as key material.
 */
export function deriveSessionKey(secret: string): Promise<CryptoKey> {
  const cached = keyCache.get(secret);
  if (cached !== undefined) {
    return cached;
  }
  const derived = crypto.subtle
    .importKey("raw", TEXT_ENCODER.encode(secret), "HKDF", false, ["deriveKey"])
    .then((material) =>
      crypto.subtle.deriveKey(
        {
          name: "HKDF",
          hash: "SHA-256",
          salt: new Uint8Array(0),
          info: TEXT_ENCODER.encode(HKDF_INFO),
        },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      ),
    );
  keyCache.set(secret, derived);
  return derived;
}

/** Encrypts session data into a fresh generation of the cookie value. */
export async function sealSession(
  data: SessionData,
  key: CryptoKey,
  now: number,
): Promise<string> {
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const plaintext = TEXT_ENCODER.encode(
    JSON.stringify({
      gen: randomBase64Url(GENERATION_BYTES),
      exp: now + SESSION_MAX_AGE_IN_SECONDS * 1_000,
      data,
    }),
  );
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: TEXT_ENCODER.encode(ENVELOPE_VERSION),
      },
      key,
      plaintext,
    ),
  );
  const envelope = new Uint8Array(nonce.length + ciphertext.length);
  envelope.set(nonce);
  envelope.set(ciphertext, nonce.length);
  return `${ENVELOPE_VERSION}.${toBase64Url(envelope)}`;
}

/** Decrypts a cookie value. Returns `null` for any unusable value. */
export async function openSession(
  value: string,
  key: CryptoKey,
  now: number,
): Promise<SessionData | null> {
  const separator = value.indexOf(".");
  if (separator === -1 || value.slice(0, separator) !== ENVELOPE_VERSION) {
    return null;
  }
  try {
    const envelope = fromBase64Url(value.slice(separator + 1));
    if (envelope.byteLength <= NONCE_BYTES) {
      return null;
    }
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: envelope.subarray(0, NONCE_BYTES),
        additionalData: TEXT_ENCODER.encode(ENVELOPE_VERSION),
      },
      key,
      envelope.subarray(NONCE_BYTES),
    );
    const parsed: unknown = JSON.parse(TEXT_DECODER.decode(plaintext));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    const { gen, exp, data } = parsed as {
      gen?: unknown;
      exp?: unknown;
      data?: unknown;
    };
    if (typeof gen !== "string" || gen === "") {
      return null;
    }
    if (typeof exp !== "number" || !Number.isFinite(exp) || exp <= now) {
      return null;
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return null;
    }
    return data as SessionData;
  } catch {
    return null;
  }
}

function assertSizeBounds(value: string, header: string): void {
  if (TEXT_ENCODER.encode(value).byteLength > MAX_COOKIE_VALUE_BYTES) {
    throw new CustomerAccountSessionError(
      "Customer Account session value exceeds its size bound.",
    );
  }
  if (
    TEXT_ENCODER.encode(`${SET_COOKIE_PREFIX}${header}`).byteLength >
    MAX_SET_COOKIE_BYTES
  ) {
    throw new CustomerAccountSessionError(
      "Customer Account Set-Cookie header exceeds its size bound.",
    );
  }
}

/** Host-only, HttpOnly, SameSite=Lax cookie scoped to the whole site. */
export function serializeSessionCookie(
  value: string,
  options: CookieOptions,
): string {
  const header = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
    `Max-Age=${SESSION_MAX_AGE_IN_SECONDS}`,
    ...(options.secure ? ["Secure"] : []),
  ].join("; ");
  assertSizeBounds(value, header);
  return header;
}

/** Complete removal of the session cookie, used by logout and empty commits. */
export function serializeSessionDeletion(options: CookieOptions): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ...(options.secure ? ["Secure"] : []),
  ].join("; ");
}

/** Reads one unambiguous session cookie from a raw `Cookie` header. */
export function readSessionCookie(cookieHeader: string | null): string | null {
  if (cookieHeader === null) {
    return null;
  }
  let found: string | null = null;
  let matches = 0;
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) {
      continue;
    }
    if (pair.slice(0, separator).trim() === COOKIE_NAME) {
      matches += 1;
      if (matches > 1) {
        return null;
      }
      const value = pair.slice(separator + 1).trim();
      found = value === "" ? null : value;
    }
  }
  return found;
}
