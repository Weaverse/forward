import type { Metadata } from "next";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import { AddressActionForm } from "@/components/address-form";
import {
  hasRefreshMarker,
  readAccountSession,
} from "@/lib/account/account-view";
import {
  ADDRESSES_PATH,
  type AddressFormValues,
  readAccountAddresses,
} from "@/lib/account/addresses";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Addresses · Account",
  description: "Your saved Forward addresses.",
  robots: { index: false, follow: false },
};

const EMPTY_ADDRESS: AddressFormValues = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  zoneCode: "",
  zip: "",
  territoryCode: "",
  phoneNumber: "",
};

interface AddressesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface AddressFieldsProps {
  /** Unique per rendered form, so labels stay bound to their own inputs. */
  idPrefix: string;
  values: AddressFormValues;
}

/**
 * The bounded `CustomerAddressInput` subset Forward writes, as plain inputs.
 * `required`/`maxLength`/`pattern` mirror the server-side schema; the server
 * revalidates all of it and never trusts these attributes.
 */
function AddressFields({ idPrefix, values }: AddressFieldsProps) {
  const field = (name: string) => `${idPrefix}-${name}`;
  return (
    <>
      <div className="form-field">
        <label htmlFor={field("firstName")}>First name</label>
        <input
          id={field("firstName")}
          name="firstName"
          defaultValue={values.firstName}
          maxLength={255}
          autoComplete="given-name"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("lastName")}>Last name</label>
        <input
          id={field("lastName")}
          name="lastName"
          defaultValue={values.lastName}
          maxLength={255}
          autoComplete="family-name"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("company")}>Company (optional)</label>
        <input
          id={field("company")}
          name="company"
          defaultValue={values.company}
          maxLength={255}
          autoComplete="organization"
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("address1")}>Address</label>
        <input
          id={field("address1")}
          name="address1"
          defaultValue={values.address1}
          maxLength={255}
          autoComplete="address-line1"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("address2")}>
          Apartment, suite, unit (optional)
        </label>
        <input
          id={field("address2")}
          name="address2"
          defaultValue={values.address2}
          maxLength={255}
          autoComplete="address-line2"
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("city")}>City</label>
        <input
          id={field("city")}
          name="city"
          defaultValue={values.city}
          maxLength={255}
          autoComplete="address-level2"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("zoneCode")}>
          State / province code (optional)
        </label>
        <input
          id={field("zoneCode")}
          name="zoneCode"
          defaultValue={values.zoneCode}
          maxLength={12}
          placeholder="CA"
          autoComplete="address-level1"
        />
        <p className="form-note">
          Use a region code, not a name. Leave blank when the country has no
          state or province code, such as Vietnam.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor={field("zip")}>Postal code (optional)</label>
        <input
          id={field("zip")}
          name="zip"
          defaultValue={values.zip}
          maxLength={32}
          autoComplete="postal-code"
        />
      </div>
      <div className="form-field">
        <label htmlFor={field("territoryCode")}>Country code</label>
        <input
          id={field("territoryCode")}
          name="territoryCode"
          defaultValue={values.territoryCode}
          maxLength={2}
          pattern="[A-Za-z]{2}"
          placeholder="US"
          autoComplete="country"
          required
        />
        <p className="form-note">Two-letter ISO country code, such as US.</p>
      </div>
      <div className="form-field">
        <label htmlFor={field("phoneNumber")}>Phone (optional)</label>
        <input
          id={field("phoneNumber")}
          name="phoneNumber"
          defaultValue={values.phoneNumber}
          maxLength={32}
          pattern="\+[1-9][0-9]{1,14}"
          placeholder="+16135551111"
          autoComplete="tel"
        />
        <p className="form-note">E.164 format, including the country code.</p>
      </div>
    </>
  );
}

/**
 * Saved addresses, with create / edit / delete / make-default.
 *
 * Every control is a raw full-page form posting to one Server Action: no
 * client-held address state, and each form carries its own explicit intent.
 * Editing opens in a native `<details>`, so the page needs no JavaScript to be
 * usable.
 */
export default async function AddressesPage({
  searchParams,
}: AddressesPageProps) {
  const params = await searchParams;
  const session = await readAccountSession({
    path: ADDRESSES_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath={ADDRESSES_PATH}
        eyebrow="Field account / Addresses"
        title="Where the gear ships."
      >
        <AccountAccessPanel path={ADDRESSES_PATH} session={session} />
      </AccountShell>
    );
  }

  const addresses = await readAccountAddresses(session);

  return (
    <AccountShell
      activePath={ADDRESSES_PATH}
      eyebrow="Field account / Addresses"
      title="Where the gear ships."
      lede="Add, edit, or retire the addresses we ship your kit to."
      signedIn
    >
      <div className="account-header">
        <p className="eyebrow">Saved trailheads</p>
        <h2 className="h2">Addresses</h2>
      </div>
      {addresses.length > 0 ? (
        <div className="account-grid">
          {addresses.map((address) => (
            <article key={address.id} className="account-block">
              <p className="eyebrow">
                {address.isDefault ? "Default" : "Saved"}
              </p>
              <address>
                {address.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
              {address.isDefault ? null : (
                <AddressActionForm
                  submitLabel="Make default"
                  submitClassName="text-link"
                >
                  <input type="hidden" name="intent" value="default" />
                  <input type="hidden" name="addressId" value={address.id} />
                </AddressActionForm>
              )}
              <AddressActionForm
                submitLabel="Delete address"
                submitClassName="text-link"
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="addressId" value={address.id} />
              </AddressActionForm>
              <details>
                <summary className="text-link">Edit address</summary>
                <AddressActionForm submitLabel="Save changes">
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="addressId" value={address.id} />
                  <AddressFields
                    idPrefix={address.id}
                    values={address.values}
                  />
                </AddressActionForm>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">No addresses saved yet.</p>
      )}
      <div className="account-block">
        <details>
          <summary className="text-link">Add an address</summary>
          <AddressActionForm submitLabel="Save address">
            <input type="hidden" name="intent" value="create" />
            <AddressFields idPrefix="new-address" values={EMPTY_ADDRESS} />
            <div className="check-row">
              <input
                id="new-address-default"
                type="checkbox"
                name="defaultAddress"
              />
              <label htmlFor="new-address-default">
                Use this as my default address
              </label>
            </div>
          </AddressActionForm>
        </details>
      </div>
    </AccountShell>
  );
}
