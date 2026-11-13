import type { Metadata } from "next";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountOrderList } from "@/components/account-orders";
import { AccountShell } from "@/components/account-shell";
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
      <AccountOrderList orders={profile.orders} locale={locale} t={t} />
    </AccountShell>
  );
}
