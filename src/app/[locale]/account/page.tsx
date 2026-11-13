import type { Metadata } from "next";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountOrderList } from "@/components/account-orders";
import { AccountShell } from "@/components/account-shell";
import { Link } from "@/components/link";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_RECENT_ORDER_LIMIT } from "@/lib/account/queries";
import { localizePath } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator, translatedMetadata } from "@/lib/i18n/translator";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata({
  params,
}: Pick<AccountPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "account.meta.overviewTitle",
    description: "account.meta.overviewDescription",
    robots: { index: false, follow: false },
  });
}

const ACCOUNT_PATH = "/account";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ACCOUNT_BLOCK_CLASS = "min-h-70 border border-ink bg-transparent p-7";

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
      <AccountOrderList orders={profile.orders} locale={locale} t={t} />

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
