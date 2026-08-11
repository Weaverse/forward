"use server";

/**
 * The one writable server-only boundary for address changes.
 *
 * Everything decided here is decided in `addresses.ts`; this file only supplies
 * the request headers, the session, and the two side effects a Server Action
 * can perform. It never refreshes a token: an unusable session redirects
 * through the bounded refresh/login flow instead, and a known-successful
 * mutation revalidates and redirects to the one fixed `/account/addresses`.
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import type { AddressActionState } from "./address-action-state";
import { readAccountSession } from "./account-view";
import {
  ADDRESSES_PATH,
  ADDRESS_ERROR_FAILED,
  performAddressAction,
} from "./addresses";
import { getCustomerAccountRuntime } from "./customer-account";

export async function saveAddress(
  _previous: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const runtime = getCustomerAccountRuntime();
  if (runtime === null) {
    // Disabled account mode answers exactly like an unknown path.
    notFound();
  }

  const requestHeaders = await headers();
  const session = await readAccountSession({
    path: ADDRESSES_PATH,
    refreshed: false,
  });
  if (session.status === "authenticated") {
    try {
      const committed = new Headers(await session.commitSession());
      if (committed.has("set-cookie")) {
        // A mutation must not silently rotate or drop OAuth state. Reject before
        // the Shopify write if the supposedly read-only token lookup became dirty.
        return { message: ADDRESS_ERROR_FAILED };
      }
    } catch {
      return { message: ADDRESS_ERROR_FAILED };
    }
  }
  const result = await performAddressAction({
    session,
    requestHeaders,
    // The configured origin, never a Host/Forwarded header.
    origin: runtime.config.storefrontOrigin,
    formData,
  });

  if (result.status === "error") {
    return { message: result.message };
  }
  if (result.status === "redirect") {
    redirect(result.href);
  }
  revalidatePath(ADDRESSES_PATH);
  redirect(ADDRESSES_PATH);
}
