import type { Metadata } from "next";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import {
  hasRefreshMarker,
  readAccountSession,
} from "@/lib/account/account-view";
import {
  ADDRESSES_PATH,
  type AddressFormValues,
  readAccountAddresses,
} from "@/lib/account/addresses";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import type { ThemeTranslate } from "@/lib/i18n/static-content";
import { getTranslator } from "@/lib/i18n/translator";
import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
import { AddressActionForm } from "./address-form";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: Pick<AddressesPageProps, "params">): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    title: t("account.meta.addressesTitle"),
    description: t("account.meta.addressesDescription"),
    robots: { index: false, follow: false },
  };
}

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
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface AddressFieldsProps {
  /** Unique per rendered form, so labels stay bound to their own inputs. */
  idPrefix: string;
  t: ThemeTranslate;
  values: AddressFormValues;
}

const FIELD_CLASS = "my-5.5";
const LABEL_CLASS = "mb-2 block text-ui font-bold tracking-button uppercase";
const INPUT_CLASS =
  "min-h-13 w-full rounded-none border border-border-field bg-transparent p-3 text-text-inverse focus:border-surface-dark focus:outline-3 focus:outline-focus-field";
const FORM_NOTE_CLASS = "text-caption text-text-dark-muted";
const ACCOUNT_BLOCK_CLASS = "min-h-70 border border-ink bg-transparent p-7";

/**
 * The bounded `CustomerAddressInput` subset Forward writes, as plain inputs.
 * `required`/`maxLength`/`pattern` mirror the server-side schema; the server
 * revalidates all of it and never trusts these attributes.
 */
function AddressFields({ idPrefix, t, values }: AddressFieldsProps) {
  const field = (name: string) => `${idPrefix}-${name}`;
  return (
    <>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("firstName")}>
          {t("account.fields.firstName")}
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
          {t("account.fields.lastName")}
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
          {t("account.fields.company")}
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
          {t("account.fields.address1")}
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
          {t("account.fields.address2")}
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
          {t("account.fields.city")}
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
          {t("account.fields.zoneCode")}
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
        <p className={FORM_NOTE_CLASS}>{t("account.fields.zoneCodeHint")}</p>
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("zip")}>
          {t("account.fields.zip")}
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
          {t("account.fields.territoryCode")}
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
          {t("account.fields.territoryCodeHint")}
        </p>
      </div>
      <div className={FIELD_CLASS}>
        <label className={LABEL_CLASS} htmlFor={field("phoneNumber")}>
          {t("account.fields.phone")}
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
        <p className={FORM_NOTE_CLASS}>{t("account.fields.phoneHint")}</p>
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
  params: routeParams,
  searchParams,
}: AddressesPageProps) {
  const locale = await routeLocale(routeParams);
  const t = await getTranslator(locale);
  const params = await searchParams;
  const session = await readAccountSession({
    locale,
    path: ADDRESSES_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath={ADDRESSES_PATH}
        t={t}
        eyebrow={t("account.addressesEyebrow")}
        title={t("account.addressesTitle")}
      >
        <AccountAccessPanel t={t} path={ADDRESSES_PATH} session={session} />
      </AccountShell>
    );
  }

  const addresses = await readAccountAddresses(session);

  return (
    <AccountShell
      activePath={ADDRESSES_PATH}
      t={t}
      eyebrow={t("account.addressesEyebrow")}
      title={t("account.addressesTitle")}
      lede={t("account.addressesLede")}
      signedIn
    >
      <div className="mb-13">
        <p className={eyebrow()}>{t("account.savedTrailheads")}</p>
        <h2 className={sectionHeading()}>{t("account.addressesHeading")}</h2>
      </div>
      {addresses.length > 0 ? (
        <div className="mt-12.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className={ACCOUNT_BLOCK_CLASS}>
              <p className={eyebrow()}>
                {t(
                  address.isDefault
                    ? "account.defaultBadge"
                    : "account.savedBadge",
                )}
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
                  submitLabel={t("account.makeDefault")}
                  submitClassName={textLink()}
                >
                  <input type="hidden" name="intent" value="default" />
                  <input type="hidden" name="addressId" value={address.id} />
                </AddressActionForm>
              )}
              <AddressActionForm
                submitLabel={t("account.deleteAddress")}
                submitClassName={textLink()}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="addressId" value={address.id} />
              </AddressActionForm>
              <details>
                <summary className={textLink()}>
                  {t("account.editAddress")}
                </summary>
                <AddressActionForm submitLabel={t("account.saveChanges")}>
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="addressId" value={address.id} />
                  <AddressFields
                    idPrefix={address.id}
                    t={t}
                    values={address.values}
                  />
                </AddressActionForm>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-text-muted">{t("account.noAddresses")}</p>
      )}
      <div className={ACCOUNT_BLOCK_CLASS}>
        <details>
          <summary className={textLink()}>{t("account.addAddress")}</summary>
          <AddressActionForm submitLabel={t("account.saveAddress")}>
            <input type="hidden" name="intent" value="create" />
            <AddressFields
              idPrefix="new-address"
              t={t}
              values={EMPTY_ADDRESS}
            />
            <div className="flex min-h-10 items-center gap-2.5 font-body text-micro text-text-muted">
              <input
                className="size-4.25 accent-signal-strong"
                id="new-address-default"
                type="checkbox"
                name="defaultAddress"
              />
              <label htmlFor="new-address-default">
                {t("account.useAsDefault")}
              </label>
            </div>
          </AddressActionForm>
        </details>
      </div>
    </AccountShell>
  );
}
