import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import { Link } from "@/components/link";
import {
  hasRefreshMarker,
  readAccountOrder,
  readAccountSession,
} from "@/lib/account/account-view";
import { cn } from "@/lib/cn";
import { DEFAULT_LOCALE, localizePath, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator } from "@/lib/i18n/translator";
import { eyebrow, textLink } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";

/**
 * An order is an authenticated per-customer resource: never prerendered, never
 * cached, and never enumerated into build-time route parameters.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: Pick<OrderPageProps, "params">): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    title: t("account.meta.orderTitle"),
    description: t("account.meta.orderDescription"),
    robots: { index: false, follow: false },
  };
}

interface OrderPageProps {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CART_LINE_CLASS =
  "grid grid-cols-line-item-compact gap-3.5 border-border-subtle border-b py-5.5 sm:grid-cols-line-item sm:gap-6";
const ACCOUNT_BLOCK_CLASS = "min-h-70 border border-ink bg-transparent p-7";
const SUMMARY_ROW_CLASS =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";

/**
 * Order detail. A malformed order number, an order belonging to another
 * customer, and an order the API declines all resolve to the same generic 404.
 */
export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const [{ orderId }, search] = await Promise.all([params, searchParams]);
  const locale = await routeLocale(params);
  const t = await getTranslator(locale);
  const path = `/account/orders/${orderId}`;
  const session = await readAccountSession({
    locale,
    path,
    refreshed: hasRefreshMarker(search),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        locale={locale}
        activePath="/account/orders"
        t={t}
        eyebrow={t("account.orderEyebrow")}
        title={t("account.orderTitle")}
      >
        <AccountAccessPanel
          t={t}
          path={localizePath(path, locale)}
          session={session}
        />
      </AccountShell>
    );
  }

  const order = await readAccountOrder(session, orderId);
  if (order === null) {
    notFound();
  }

  return (
    <AccountShell
      locale={locale}
      activePath="/account/orders"
      t={t}
      eyebrow={t("account.orderEyebrow")}
      title={order.name}
      signedIn
      heroAside={
        <div>
          <span className="font-bold text-signal-strong">
            {order.statusKey === null ? order.status : t(order.statusKey)}
          </span>
          <p className="m-0 max-w-full justify-self-start text-lede leading-lede text-text-dark-lede md:max-w-lede md:justify-self-end">
            {t("account.placed", {
              date: formatDate(order.processedAt.slice(0, 10), locale),
            })}
          </p>
        </div>
      }
    >
      <Link className={textLink()} href="/account/orders">
        {t("account.backToOrders")}
      </Link>

      <div className="border-border-subtle border-t py-section-block-compact">
        {order.lines.map((line) => (
          <article key={line.id} className={CART_LINE_CLASS}>
            <div>
              <h2 className="m-0 mb-1 text-balance font-heading text-heading-3-fixed font-medium">
                {line.title}
              </h2>
              <p className="text-text-muted">
                {line.variantTitle === null ? "" : `${line.variantTitle} · `}
                {t("account.quantity", { quantity: line.quantity })}
              </p>
            </div>
            <div className="col-start-2 font-bold whitespace-nowrap sm:col-start-auto">
              {line.total}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12.5 grid grid-cols-1 gap-3 py-section-block-compact sm:grid-cols-2">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.deliveryAddress")}</p>
          {order.shippingAddress === null ? (
            <p className="text-text-muted">{t("account.noDeliveryAddress")}</p>
          ) : (
            <address>
              {order.shippingAddress.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          )}
        </article>
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.orderTotal")}</p>
          {order.subtotal === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.subtotal")}</span>
              <span>{order.subtotal}</span>
            </div>
          )}
          {order.shipping === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.delivery")}</span>
              <span>{order.shipping}</span>
            </div>
          )}
          {order.tax === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.tax")}</span>
              <span>{order.tax}</span>
            </div>
          )}
          <div
            className={cn(
              SUMMARY_ROW_CLASS,
              "py-5 font-heading text-heading-4",
            )}
          >
            <span>{t("account.columns.total")}</span>
            <strong>{order.total}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
