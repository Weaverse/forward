import type { Metadata } from "next";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import { Link } from "@/components/link";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_ORDER_LIMIT } from "@/lib/account/queries";
import { localizePath } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator, translatedMetadata } from "@/lib/i18n/translator";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata({
  params,
}: Pick<OrdersPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "account.meta.ordersTitle",
    description: "account.meta.ordersDescription",
    robots: { index: false, follow: false },
  });
}

const ORDERS_PATH = "/account/orders";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ORDER_ROW_CLASS =
  "block border-border-subtle border-b py-3.75 sm:table-row sm:border-0 sm:py-0";
const ORDER_CELL_CLASS =
  "block border-0 px-0 py-0.75 text-left before:text-field-meta before:text-text-muted before:uppercase before:content-[attr(data-label)_':_'] sm:table-cell sm:border-border-subtle sm:border-b sm:px-3 sm:py-4.5 sm:before:content-none";
const ORDER_HEADING_CLASS =
  "border-border-subtle border-b px-3 pt-0 pb-4.5 text-left text-field-meta text-text-muted tracking-label uppercase";

/** Order history on its own private route. */
export default async function OrdersPage({
  params: routeParams,
  searchParams,
}: OrdersPageProps) {
  const locale = await routeLocale(routeParams);
  const t = await getTranslator(locale);
  const params = await searchParams;
  const session = await readAccountSession({
    locale,
    path: ORDERS_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        locale={locale}
        activePath={ORDERS_PATH}
        t={t}
        eyebrow={t("account.ordersEyebrow")}
        title={t("account.ordersTitle")}
      >
        <AccountAccessPanel
          t={t}
          path={localizePath(ORDERS_PATH, locale)}
          session={session}
        />
      </AccountShell>
    );
  }

  const profile = await readAccountProfile(session, ACCOUNT_ORDER_LIMIT);

  return (
    <AccountShell
      locale={locale}
      activePath={ORDERS_PATH}
      t={t}
      eyebrow={t("account.ordersEyebrow")}
      title={t("account.ordersTitle")}
      lede={t("account.ordersLede", { count: ACCOUNT_ORDER_LIMIT })}
      signedIn
    >
      <div className="mb-13">
        <p className={eyebrow()}>{t("account.recentLog")}</p>
        <h2 className={sectionHeading()}>{t("account.ordersHeading")}</h2>
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
    </AccountShell>
  );
}
