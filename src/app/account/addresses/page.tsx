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

const EYEBROW_CLASS =
  "mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase";
const FIELD_CLASS = "my-[22px]";
const LABEL_CLASS =
  "mb-2 block text-[11px] font-bold tracking-[0.09em] uppercase";
const INPUT_CLASS =
  "min-h-[52px] w-full rounded-none border border-[#686b63] bg-transparent p-3 text-text-inverse focus:border-surface-dark focus:outline-[3px] focus:outline-[rgba(23,61,45,0.18)]";
const FORM_NOTE_CLASS = "text-[12px] text-text-dark-muted";
const TEXT_LINK_CLASS =
  "inline-flex min-h-touch items-center gap-[14px] border-ink border-b bg-transparent font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]";
const ACCOUNT_BLOCK_CLASS =
  "min-h-[280px] border border-ink bg-transparent p-7";

/**
 * The bounded `CustomerAddressInput` subset Forward writes, as plain inputs.
 * `required`/`maxLength`/`pattern` mirror the server-side schema; the server
 * revalidates all of it and never trusts these attributes.
 */
function AddressFields({ idPrefix, values }: AddressFieldsProps) {
  const field = (name: string) => `${idPrefix}-${name}`;
  return (
    <>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("firstName")}>
          First name
        </label>
        <input
          className={INPUT_CLASS}
          id={field("firstName")}
          name="firstName"
          defaultValue={values.firstName}
          maxLength={255}
          autoComplete="given-name"
          required
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("lastName")}>
          Last name
        </label>
        <input
          className={INPUT_CLASS}
          id={field("lastName")}
          name="lastName"
          defaultValue={values.lastName}
          maxLength={255}
          autoComplete="family-name"
          required
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("company")}>
          Company (optional)
        </label>
        <input
          className={INPUT_CLASS}
          id={field("company")}
          name="company"
          defaultValue={values.company}
          maxLength={255}
          autoComplete="organization"
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("address1")}>
          Address
        </label>
        <input
          className={INPUT_CLASS}
          id={field("address1")}
          name="address1"
          defaultValue={values.address1}
          maxLength={255}
          autoComplete="address-line1"
          required
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("address2")}>
          Apartment, suite, unit (optional)
        </label>
        <input
          className={INPUT_CLASS}
          id={field("address2")}
          name="address2"
          defaultValue={values.address2}
          maxLength={255}
          autoComplete="address-line2"
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("city")}>
          City
        </label>
        <input
          className={INPUT_CLASS}
          id={field("city")}
          name="city"
          defaultValue={values.city}
          maxLength={255}
          autoComplete="address-level2"
          required
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("zoneCode")}>
          State / province code (optional)
        </label>
        <input
          className={INPUT_CLASS}
          id={field("zoneCode")}
          name="zoneCode"
          defaultValue={values.zoneCode}
          maxLength={12}
          placeholder="CA"
          autoComplete="address-level1"
        />
        <p className={FORM_NOTE_CLASS}>
          Use a region code, not a name. Leave blank when the country has no
          state or province code, such as Vietnam.
        </p>
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("zip")}>
          Postal code (optional)
        </label>
        <input
          className={INPUT_CLASS}
          id={field("zip")}
          name="zip"
          defaultValue={values.zip}
          maxLength={32}
          autoComplete="postal-code"
        />
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("territoryCode")}>
          Country code
        </label>
        <input
          className={INPUT_CLASS}
          id={field("territoryCode")}
          name="territoryCode"
          defaultValue={values.territoryCode}
          maxLength={2}
          pattern="[A-Za-z]{2}"
          placeholder="US"
          autoComplete="country"
          required
        />
        <p className={FORM_NOTE_CLASS}>
          Two-letter ISO country code, such as US.
        </p>
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("phoneNumber")}>
          Phone (optional)
        </label>
        <input
          className={INPUT_CLASS}
          id={field("phoneNumber")}
          name="phoneNumber"
          defaultValue={values.phoneNumber}
          maxLength={32}
          pattern="\+[1-9][0-9]{1,14}"
          placeholder="+16135551111"
          autoComplete="tel"
        />
        <p className={FORM_NOTE_CLASS}>
          E.164 format, including the country code.
        </p>
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
      <div className="mb-[52px]">
        <p className={EYEBROW_CLASS}>Saved trailheads</p>
        <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
          Addresses
        </h2>
      </div>
      {addresses.length > 0 ? (
        <div className="mt-[50px] grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {addresses.map((address) => (
            <article key={address.id} className={ACCOUNT_BLOCK_CLASS}>
              <p className={EYEBROW_CLASS}>
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
                  submitClassName={TEXT_LINK_CLASS}
                >
                  <input type="hidden" name="intent" value="default" />
                  <input type="hidden" name="addressId" value={address.id} />
                </AddressActionForm>
              )}
              <AddressActionForm
                submitLabel="Delete address"
                submitClassName={TEXT_LINK_CLASS}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="addressId" value={address.id} />
              </AddressActionForm>
              <details>
                <summary className={TEXT_LINK_CLASS}>Edit address</summary>
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
        <p className="text-text-muted">No addresses saved yet.</p>
      )}
      <div className={ACCOUNT_BLOCK_CLASS}>
        <details>
          <summary className={TEXT_LINK_CLASS}>Add an address</summary>
          <AddressActionForm submitLabel="Save address">
            <input type="hidden" name="intent" value="create" />
            <AddressFields idPrefix="new-address" values={EMPTY_ADDRESS} />
            <div className="flex min-h-10 items-center gap-2.5 font-body text-[9px] text-text-muted">
              <input
                className="size-[17px] accent-signal-strong"
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
