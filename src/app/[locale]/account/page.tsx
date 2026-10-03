import type { Metadata } from "next";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import { Link } from "@/components/link";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_RECENT_ORDER_LIMIT } from "@/lib/account/queries";
import { DEFAULT_LOCALE, localizePath, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator } from "@/lib/i18n/translator";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: Pick<AccountPageProps, "params">): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    title: t("account.meta.overviewTitle"),
    description: t("account.meta.overviewDescription"),
    robots: { index: false, follow: false },
  };
}

const ACCOUNT_PATH = "/account";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ACCOUNT_BLOCK_CLASS = "min-h-70 border border-ink bg-transparent p-7";
const ORDER_ROW_CLASS =
  "block border-border-subtle border-b py-3.75 sm:table-row sm:border-0 sm:py-0";
const ORDER_CELL_CLASS =
  "block border-0 px-0 py-0.75 text-left before:text-field-meta before:text-text-muted before:uppercase before:content-[attr(data-label)_':_'] sm:table-cell sm:border-border-subtle sm:border-b sm:px-3 sm:py-4.5 sm:before:content-none";
const ORDER_HEADING_CLASS =
  "border-border-subtle border-b px-3 pt-0 pb-4.5 text-left text-field-meta text-text-muted tracking-label uppercase";

/**
 * Account overview — the accepted order history and bordered account blocks,
 * filled from the Customer Account API.
 */
export default async function AccountPage({
  params: routeParams,
  searchParams,
}: AccountPageProps) {
  const locale = await routeLocale(routeParams);
  const t = await getTranslator(locale);
  const params = await searchParams;
  const session = await readAccountSession({
    locale,
    path: ACCOUNT_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        locale={locale}
        activePath={ACCOUNT_PATH}
        t={t}
        title={t("account.overviewTitle")}
        lede={t("account.overviewLede")}
      >
        <AccountAccessPanel
          t={t}
          path={localizePath(ACCOUNT_PATH, locale)}
          session={session}
          loginFailed={params.login === "failed"}
        />
      </AccountShell>
    );
  }

  const profile = await readAccountProfile(session, ACCOUNT_RECENT_ORDER_LIMIT);
  const defaultAddress = profile.addresses.find((address) => address.isDefault);

  return (
    <AccountShell
      locale={locale}
      activePath={ACCOUNT_PATH}
      t={t}
      title={t("account.overviewTitle")}
      lede={t("account.overviewLede")}
      signedIn
    >
      <div className="mb-13">
        <p className={eyebrow()}>{profile.displayName}</p>
        <h2 className={sectionHeading()}>{t("account.recentOrders")}</h2>
      </div>
      {profile.orders.length > 0 ? (
        <table className="w-full border-collapse">
          <thead className="hidden sm:table-header-group">
            <tr>
              <th className={ORDER_HEADING_CLASS}>
                {t("account.columns.order")}
              </th>
              <th className={ORDER_HEADING_CLASS}>
                {t("account.columns.date")}
              </th>
              <th className={ORDER_HEADING_CLASS}>
                {t("account.columns.status")}
              </th>
              <th className={ORDER_HEADING_CLASS}>
                {t("account.columns.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {profile.orders.map((order) => (
              <tr className={ORDER_ROW_CLASS} key={order.number}>
                <td
                  className={ORDER_CELL_CLASS}
                  data-label={t("account.columns.order")}
                >
                  <strong>
                    <Link href={order.href}>{order.name}</Link>
                  </strong>
                </td>
                <td
                  className={ORDER_CELL_CLASS}
                  data-label={t("account.columns.date")}
                >
                  {formatDate(order.processedAt.slice(0, 10), locale)}
                </td>
                <td
                  className={ORDER_CELL_CLASS}
                  data-label={t("account.columns.status")}
                >
                  <span className="font-bold text-signal-strong">
                    {order.statusKey === null
                      ? order.status
                      : t(order.statusKey)}
                  </span>
                </td>
                <td
                  className={ORDER_CELL_CLASS}
                  data-label={t("account.columns.total")}
                >
                  {order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-text-muted">{t("account.noOrders")}</p>
      )}

      <div className="mt-12.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.repairEyebrow")}</p>
          <h3 className="text-balance font-heading text-account-title font-medium">
            {t("account.repairHeading")}
          </h3>
          <p className="text-text-muted">{t("account.repairBody")}</p>
          <Link className={cta()} href="/pages/field-repair">
            {t("account.repairCta")}
          </Link>
        </article>
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.defaultAddress")}</p>
          {defaultAddress !== undefined ? (
            <>
              <h3 className="text-balance font-heading text-account-title font-medium">
                {profile.displayName}
              </h3>
              <address>
                {defaultAddress.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            </>
          ) : (
            <p className="text-text-muted">{t("account.noAddressesShort")}</p>
          )}
        </article>
      </div>
    </AccountShell>
  );
}
